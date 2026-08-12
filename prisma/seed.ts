import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// Demo accounts
const DEMO_USERS = [
  {
    email: 'pasteur@churchconnect.com',
    name: 'Pasteur Jean-Marc Lumbu',
    password: 'password123',
    role: 'PASTOR',
  },
  {
    email: 'admin@churchconnect.com',
    name: 'Admin Marie Nseke',
    password: 'admin123',
    role: 'ADMIN',
  },
  {
    email: 'tresorier@churchconnect.com',
    name: 'Trésorier Pierre Mukamba',
    password: 'tresorier123',
    role: 'TREASURER',
  },
  {
    email: 'membre@churchconnect.com',
    name: 'François Mutombo',
    password: 'membre123',
    role: 'MEMBER',
  },
];

// Sample first names and last names for generating members
const FIRST_NAMES = [
  'Jean', 'Marie', 'Pierre', 'Françoise', 'Joseph', 'Anne', 'Jacques', 'Marie-Thérèse',
  'Paul', 'Nicole', 'André', 'Claire', 'Michel', 'Isabelle', 'Philippe', 'Sophie',
  'Christophe', 'Julie', 'Laurent', 'Camille', 'David', 'Aurélie', 'Stéphane', 'Léa',
  'Thierry', 'Charlotte', 'Patricia', 'Valérie', 'Gérard', 'Sandrine', 'Alain', 'Émilie'
];

const LAST_NAMES = [
  'Mutombo', 'Lumbu', 'Nseke', 'Kamba', 'Mukamba', 'Ngoyi', 'Tshisekedi', 'Kasavubu',
  'Malula', 'Mpolo', 'Bemba', 'Kabongo', 'Mbumba', 'Ngoma', 'Loso', 'Mbuyi',
  'Tshitengo', 'Kalala', 'Mpunga', 'Kazadi', 'Mwamba', 'Ilunga', 'Kabeya', 'Mutshail'
];

const DEPARTMENTS = [
  { name: 'Jeunesse', description: 'Ministère des jeunes de 15 à 35 ans', color: '#8b5cf6' },
  { name: 'Femmes', description: 'Ministère des femmes', color: '#ec4899' },
  { name: 'Hommes', description: 'Ministère des hommes', color: '#3b82f6' },
  { name: 'Chorale', description: 'Ministère de la louange et adoration', color: '#f59e0b' },
  { name: "École du Dimanche", description: 'Enseignement biblique pour les enfants', color: '#10b981' },
  { name: 'Protocole', description: "Service d'accueil et protocole", color: '#6366f1' },
  { name: 'Communication', description: 'Communication et médias', color: '#06b6d4' },
  { name: 'Intercession', description: 'Ministère de prière et intercession', color: '#f43f5e' },
  { name: 'Évangélisation', description: 'Ministère d\'évangélisation et missions', color: '#84cc16' },
  { name: 'Diaconat', description: 'Service d\'entraide et assistance sociale', color: '#d946ef' },
];

const GROUP_NAMES = [
  'Groupe de Matonge', 'Groupe de Limeté', 'Groupe de Ngaliema',
  'Groupe de la Victoire', 'Groupe de Bandalungwa', 'Groupe de la Grâce',
  'Groupe des Jeunes Pros', 'Groupe des Couples', 'Groupe Universitaire',
  'Groupe des Professionnels', 'Groupe de Kinshasa', 'Groupe de la Paix'
];

const SERMON_TITLES = [
  'La Puissance de la Prière Persistante',
  'Marcher par la Foi et non par la Vue',
  "L'Amour qui Transforme",
  'La Grâce Suffisante',
  'Vivre dans la Victoire',
  "L'Importance de la Communauté",
  'Le Pardon qui Libère',
  'La Joie du Seigneur comme Force',
  'Trouver la Paix dans la Tempête',
  "Le Coeur d'un Vainqueur",
  'Les Promesses de Dieu pour Votre Vie',
  'Comment Entendre la Voix de Dieu'
];

const SERMON_CATEGORIES = ['Foi', 'Vie Chrétienne', 'Amour', 'Prières', 'Victoire', 'Communauté', 'Pardon', 'Joie', 'Paix'];

const PREACHERS = [
  'Pasteur Jean-Marc Lumbu',
  'Dr. Marie Nseke',
  'Évangéliste Paul Kamba',
  'Pasteur Étienne Malula',
  'Dr. Claire Tshitengo',
  'Ancien Jacques Kabongo'
];

const EVENT_TITLES = [
  'Veillée de Fin d\'Année',
  'Conférence des Jeunes 2025',
  'Séminaire de Couple',
  'Retraite Spirituelle Printemps',
  'Camp des Adolescents',
  'Journée de Prière et Jeûn',
  'Concert de Louange',
  'Conférence sur la Famille',
  'Atelier de Leadership',
  'Célébration de Pâques',
  'Assemblée Générale',
  'Journée des Enfants'
];

const PRAYER_CATEGORIES = ['Famille', 'Santé', 'Travail', 'Études', 'Finances', 'Vie Spirituelle', 'Autre'];
const PRAYER_REQUESTS = [
  'Prière pour la guérison d\'un proche malade',
  'Besoin de direction professionnelle',
  'Prière pour mon mariage en difficulté',
  'Demande d\'emploi',
  'Guérison émotionnelle après un deuil',
  'Problèmes financiers difficiles',
  'Salut pour un membre de la famille',
  'Force face aux épreuves',
  'Direction pour une décision importante',
  'Restauration de relations brisées'
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // Clean existing data
  console.log('🗑️  Cleaning existing data...');
  await prisma.notification.deleteMany();
  await prisma.like.deleteMany();
  await prisma.report.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.courseModule.deleteMany();
  await prisma.course.deleteMany();
  await prisma.marriage.deleteMany();
  await prisma.baptism.deleteMany();
  await prisma.pastoralFollowUp.deleteMany();
  await prisma.conversion.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.prayerInteraction.deleteMany();
  await prayerRequest.deleteMany();
  await prisma.liveViewer.deleteMany();
  await prisma.liveStream.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.sermon.deleteMany();
  await prisma.sermonSeries.deleteMany();
  await prisma.sermonCategory.deleteMany();
  await prisma.service.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.memberProfile.deleteMany();
  await prisma.department.deleteMany();
  await prisma.church.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Create Church
  console.log('⛪ Creating church...');
  const church = await prisma.church.create({
    data: {
      name: 'Église de la Victoire',
      description: 'Une communauté chrétienne accueillante, passionnée par Dieu et dédiée à transformer des vies par l\'amour du Christ.',
      address: '123 Avenue de la Paix, Kinshasa, RDC',
      phone: '+243 81 234 5678',
      email: 'contact@eglise-victoire.cd',
      website: 'https://eglise-victoire.cd',
      foundedAt: new Date('2005-06-15'),
    }
  });
  console.log(`   Created: ${church.name}`);

  // Create Demo Users
  console.log('\n👤 Creating demo users...');
  const createdUsers = [];
  
  for (const demoUser of DEMO_USERS) {
    const hashedPassword = await hash(demoUser.password, 10);
    const user = await prisma.user.create({
      data: {
        email: demoUser.email,
        name: demoUser.name,
        password: hashedPassword,
        role: demoUser.role as any,
        status: 'ACTIVE',
        emailVerified: true,
      }
    });
    
    // Create member profile
    await prisma.memberProfile.create({
      data: {
        userId: user.id,
        churchId: church.id,
        firstName: demoUser.name.split(' ')[0],
        lastName: demoUser.name.split(' ').slice(1).join(' ') || '',
        phone: `+243 ${randomInt(800, 999)} ${randomInt(100000, 999999)}`,
        birthDate: randomDate(new Date('1960-01-01'), new Date('2000-12-31')),
        gender: randomItem(['MALE', 'FEMALE'] as any),
        address: `${randomInt(1, 500)} Rue de la Paix, Kinshasa`,
        city: 'Kinshasa',
        membershipDate: randomDate(new Date('2015-01-01'), new Date('2024-01-01')),
        status: 'ACTIVE',
      }
    });
    
    createdUsers.push(user);
    console.log(`   ✅ ${demoUser.email} (${demoUser.role})`);
  }

  // Generate additional members
  console.log('\n👥 Generating members...');
  const allUsers = [...createdUsers];
  
  for (let i = 0; i < 35; i++) {
    const firstName = randomItem(FIRST_NAMES);
    const lastName = randomItem(LAST_NAMES);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 99)}@example.com`;
    
    const user = await prisma.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`,
        password: await hash('password123', 10),
        role: 'MEMBER',
        status: randomItem(['ACTIVE', 'ACTIVE', 'ACTIVE', 'INACTIVE'] as any),
        emailVerified: Math.random() > 0.2,
      }
    });

    await prisma.memberProfile.create({
      data: {
        userId: user.id,
        churchId: church.id,
        firstName,
        lastName,
        phone: `+243 ${randomInt(800, 999)} ${randomInt(100000, 999999)}`,
        birthDate: randomDate(new Date('1970-01-01'), new Date('2005-12-31')),
        gender: randomItem(['MALE', 'FEMALE'] as any),
        address: `${randomInt(1, 500)} Avenue ${randomItem(['de la Paix', 'du Commerce', 'de la Liberté', 'de l\'Église'])}, Kinshasa`,
        city: 'Kinshasa',
        membershipDate: randomDate(new Date('2018-01-01'), new Date('2024-10-01')),
        maritalStatus: randomItem(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'] as any),
        bio: null,
        status: user.status,
      }
    });

    allUsers.push(user);
  }
  console.log(`   Created ${allUsers.length} total users`);

  // Create Departments
  console.log('\n🏢 Creating departments...');
  const createdDepartments = [];
  
  for (let i = 0; i < DEPARTMENTS.length; i++) {
    const dept = DEPARTMENTS[i];
    const department = await prisma.department.create({
      data: {
        churchId: church.id,
        name: dept.name,
        description: dept.description,
        color: dept.color,
        headId: allUsers[randomInt(0, allUsers.length - 1)].id,
        status: 'ACTIVE',
        order: i + 1,
      }
    });
    createdDepartments.push(department);
  }
  console.log(`   Created ${createdDepartments.length} departments`);

  // Create Groups
  console.log('\n🏠 Creating house groups...');
  const createdGroups = [];
  
  for (let i = 0; i < GROUP_NAMES.length; i++) {
    const group = await prisma.group.create({
      data: {
        churchId: church.id,
        name: GROUP_NAMES[i],
        description: `Groupe de maison pour l'étude biblique, la prière et la communion.`,
        leaderId: allUsers[randomInt(4, allUsers.length - 1)].id,
        meetingDay: randomItem(['DIMANCHE', 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'] as any),
        meetingTime: `${randomInt(16, 19)}:${randomInt(0, 1) === 1 ? '30' : '00'}`,
        location: `Quartier ${randomItem(['Matonge', 'Limeté', 'Ngaliema', 'Bandalungwa', 'Gombe', 'Kintambo'])}`,
        maxSize: randomInt(10, 25),
        status: 'ACTIVE',
      }
    });
    createdGroups.push(group);

    // Add some members to the group
    const memberCount = randomInt(3, 12);
    const shuffledUsers = [...allUsers].sort(() => Math.random() - 0.5);
    for (let j = 0; j < memberCount; j++) {
      await prisma.groupMember.create({
        data: {
          groupId: group.id,
          userId: shuffledUsers[j].id,
          role: j === 0 ? 'LEADER' : 'MEMBER',
          joinedAt: randomDate(new Date('2023-01-01'), new Date()),
        }
      });
    }
  }
  console.log(`   Created ${createdGroups.length} groups`);

  // Create Sermon Categories and Series
  console.log('\n📚 Creating sermon categories and series...');
  
  for (let i = 0; i < SERMON_CATEGORIES.length; i++) {
    await prisma.sermonCategory.create({
      data: {
        churchId: church.id,
        name: SERMON_CATEGORIES[i],
        description: `Prédications sur le thème de ${SERMON_CATEGORIES[i].toLowerCase()}`,
        icon: '📖',
        order: i + 1,
      }
    });
  }

  const series1 = await prisma.sermonSeries.create({
    data: {
      churchId: church.id,
      title: 'Vainqueurs par la Foi',
      description: 'Une série sur comment vivre dans la victoire au quotidien.',
    }
  });

  const series2 = await prisma.sermonSeries.create({
    data: {
      churchId: church.id,
      title: 'Relations Restaurées',
      description: 'Comment construire des relations saines selon les principes bibliques.',
    }
  });

  // Create Sermons
  console.log('\n🎙️ Creating sermons...');
  const sermonCategories = await prisma.sermonCategory.findMany({ where: { churchId: church.id } });
  
  for (let i = 0; i < SERMON_TITLES.length; i++) {
    await prisma.sermon.create({
      data: {
        churchId: church.id,
        title: SERMON_TITLES[i],
        description: `Un enseignement approfondi sur ${SERMON_TITLES[i].toLowerCase()}. Découvrez comment appliquer ces principes bibliques dans votre vie quotidienne.`,
        preacherId: allUsers[randomInt(0, 5)].id,
        date: randomDate(new Date('2024-06-01'), new Date()),
        categoryId: sermonCategories[i % sermonCategories.length].id,
        seriesId: i < 5 ? series1.id : i >= 8 ? series2.id : null,
        verse: `${randomItem(['Jean', 'Romains', 'Psaumes', 'Éphésiens', 'Philippiens'])} ${randomInt(1, 15)}:${randomInt(1, 28)}`,
        thumbnail: `/images/sermon-${i + 1}.jpg`,
        videoUrl: 'https://example.com/video.mp4',
        duration: `${randomInt(25, 60)} min`,
        type: randomItem(['VIDEO', 'AUDIO'] as any),
        downloadsAllowed: true,
        viewsCount: randomInt(50, 500),
      }
    });
  }
  console.log(`   Created ${SERMON_TITLES.length} sermons`);

  // Create Services/Cultes
  console.log('\n⛪ Creating services...');
  const serviceTypes = ['SUNDAY_SERVICE', 'WEEKDAY_PRAYER', 'BIBLE_STUDY', 'VIGIL', 'CONFERENCE'];
  
  for (let i = 0; i < 20; i++) {
    const date = randomDate(new Date(), new Date('2025-06-01'));
    const type = randomItem(serviceTypes as any[]);
    
    await prisma.service.create({
      data: {
        churchId: church.id,
        title: type === 'SUNDAN_SERVICE' ? 'Culte du Dimanche' :
               type === 'WEEKDAY_PRAYER' ? 'Prière de Milieu de Semaine' :
               type === 'BIBLE_STUDY' ? 'Étude Biblique' :
               type === 'VIGIL' ? 'Veillée de Prière' : 'Conférence Spéciale',
        description: `Rejoignez-nous pour un moment de ${type === 'SUNDAY_SERVICE' ? 'célébration et adoration' : type === 'BIBLE_STUDY' ? 'étude approfondie de la Parole' : 'prière et communion'}.`,
        type,
        date,
        startTime: type === 'SUNDAN_SERVICE' ? '07:00' : type === 'VIGIL' ? '22:00' : '18:00',
        endTime: type === 'SUNDAN_SERVICE' ? '10:00' : type === 'VIGIL' ? '01:00' : '20:00',
        location: randomItem(['Temple Principal', 'Salle Pasteur', 'Parvis Extérieur', 'Centre Conférences']),
        preacherId: allUsers[randomInt(0, 5)].id,
        status: date < new Date() ? 'COMPLETED' : 'SCHEDULED',
        liveUrl: type === 'SUNDAN_SERVICE' ? 'https://youtube.com/live/example' : null,
      }
    });
  }
  console.log('   Created 20 services');

  // Create Events
  console.log('\n📅 Creating events...');
  
  for (let i = 0; i < EVENT_TITLES.length; i++) {
    const date = randomDate(new Date(), new Date('2025-09-01'));
    const event = await prisma.event.create({
      data: {
        churchId: church.id,
        title: EVENT_TITLES[i],
        description: `Ne manquez pas cet événement spécial ! Rejoignez-nous pour ${EVENT_TITLES[i].toLowerCase()}. Un moment de fellowship, d'enseignement et de bénédiction.`,
        image: `/images/event-${i + 1}.jpg`,
        date,
        startTime: `${randomInt(8, 18)}:00`,
        endTime: `${randomInt(17, 22)}:00`,
        location: randomItem(['Temple Principal', 'Centre Conférences', 'Salle Pasteur', 'Extérieur']),
        organizerId: allUsers[randomInt(0, 9)].id,
        maxParticipants: randomInt(50, 500),
        status: 'OPEN',
        registrationDeadline: new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week before
      }
    });

    // Add some registrations
    const regCount = randomInt(10, event.maxParticipants! / 2);
    for (let j = 0; j < regCount; j++) {
      await prisma.eventRegistration.create({
        data: {
          eventId: event.id,
          userId: allUsers[randomInt(0, allUsers.length - 1)].id,
          registeredAt: randomDate(new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000), date),
          attended: Math.random() > 0.3,
        }
      });
    }
  }
  console.log(`   Created ${EVENT_TITLES.length} events`);

  // Create Prayer Requests
  console.log('\n🙏 Creating prayer requests...');
  
  for (let i = 0; i < PRAYER_REQUESTS.length; i++) {
    const prayer = await prisma.prayerRequest.create({
      data: {
        userId: allUsers[randomInt(0, allUsers.length - 1)].id,
        churchId: church.id,
        title: PRAYER_REQUESTS[i],
        description: `Je demande vos prières pour: ${PRAYER_REQUESTS[i].toLowerCase()}. Merci de votre soutien dans la prière.`,
        category: randomItem(PRAYER_CATEGORIES as any[]),
        visibility: randomItem(['COMMUNITY', 'PRIVATE', 'PASTORAL'] as any[]),
        isAnswered: Math.random() > 0.7,
        answeredAt: Math.random() > 0.7 ? new Date() : null,
        prayerCount: randomInt(1, 30),
      }
    });

    // Add prayer interactions
    for (let j = 0; j < prayer.prayerCount; j++) {
      await prisma.prayerInteraction.create({
        data: {
          prayerRequestId: prayer.id,
          userId: allUsers[randomInt(0, allUsers.length - 1)].id,
          type: 'PRAYED',
        }
      });
    }
  }
  console.log(`   Created ${PRAYER_REQUESTS.length} prayer requests`);

  // Create Donations
  console.log('\n💰 Creating donations...');
  const donationCategories = ['DIME', 'OFFERING', 'DONATION', 'MISSION', 'CONSTRUCTION', 'PROJECT', 'OTHER'];
  const methods = ['MOBILE_MONEY', 'CASH', 'BANK_TRANSFER', 'CARD'];
  
  for (let i = 0; i < 80; i++) {
    const amount = randomItem([5000, 10000, 20000, 50000, 100000, 200000]);
    await prisma.donation.create({
      data: {
        userId: allUsers[randomInt(0, allUsers.length - 1)].id,
        churchId: church.id,
        categoryId: '', // Will be set after creating categories
        amount,
        currency: 'FCFA',
        method: randomItem(methods as any[]),
        reference: `DON-${Date.now()}-${randomInt(1000, 9999)}`,
        status: randomItem(['COMPLETED', 'COMPLETED', 'COMPLETED', 'PENDING'] as any[]),
        paymentDate: randomDate(new Date('2024-01-01'), new Date()),
        notes: null,
      }
    });
  }
  console.log('   Created 80 donations');

  // Create Live Streams
  console.log('\n📺 Creating live streams...');
  
  await prisma.liveStream.create({
    data: {
      churchId: church.id,
      title: 'Culte du Dimanche en Direct',
      description: 'Rejoignez-nous chaque dimanche pour notre culte en direct.',
      platform: 'YOUTUBE',
      streamUrl: 'https://youtube.com/@eglisevictoire/live',
      status: 'LIVE',
      scheduledStart: new Date(),
      scheduledEnd: new Date(Date.now() + 3 * 60 * 60 * 1000),
      actualStart: new Date(Date.now() - 30 * 60 * 1000),
      viewerCount: randomInt(150, 400),
    }
  });

  await prisma.liveStream.create({
    data: {
      churchId: church.id,
      title: 'Étude Biblique du Mercredi',
      description: 'Étude hebdomadaire de la Parole de Dieu.',
      platform: 'FACEBOOK',
      streamUrl: 'https://facebook.com/eglisevictoire/live',
      status: 'SCHEDULED',
      scheduledStart: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      scheduledEnd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      viewerCount: 0,
    }
  });
  console.log('   Created 2 live streams');

  // Create Notifications
  console.log('\n🔔 Creating notifications...');
  const notificationTypes = ['NEW_SERVICE', 'NEW_EVENT', 'NEW_SERMON', 'LIVE_STARTED', 'REMINDER', 'VERSE_OF_DAY'];
  
  for (const user of allUsers.slice(0, 20)) {
    for (let i = 0; i < randomInt(3, 8); i++) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          churchId: church.id,
          type: randomItem(notificationTypes as any[]),
          title: randomItem([
            'Nouveau culte programmé',
            'Nouvelle prédication disponible',
            'Événement à venir',
            'Rappel de prière',
            'Verset du jour',
            'Culte en direct maintenant !'
          ]),
          message: 'Vous avez une nouvelle notification concernant votre église.',
          isRead: Math.random() > 0.4,
          readAt: Math.random() > 0.4 ? new Date() : null,
          actionUrl: randomItem(['/sermons', '/events', '/live', '/member/prayers']),
        }
      });
    }
  }
  console.log('   Created notifications');

  // Create Posts (Community)
  console.log('\n📝 Creating community posts...');
  
  for (let i = 0; i < 15; i++) {
    const post = await prisma.post.create({
      data: {
        userId: allUsers[randomInt(0, allUsers.length - 1)].id,
        churchId: church.id,
        content: randomItem([
          'Loué soit Dieu pour Sa bonté ! Aujourd\'hui je suis reconnaissant pour...',
          'Je partage ce verset qui m\'a touché cette semaine...',
          'Merci à tous pour vos prières. Dieu a répondu !',
          'N\'oublions pas de prier les uns pour les autres.',
          'Témoignage de la fidélité de Dieu dans ma vie.',
          'Invitation à rejoindre notre groupe de prière ce soir.',
          'Verset du jour qui m\'encourage beaucoup.'
        ]),
        type: randomItem(['TESTIMONY', 'GENERAL', 'PRAYER_REQUEST', 'ANNOUNCEMENT'] as any[]),
        visibility: 'PUBLIC',
        likesCount: randomInt(0, 50),
        commentsCount: randomInt(0, 20),
        isPinned: Math.random() > 0.9,
      }
    });

    // Add comments
    for (let j = 0; j < post.commentsCount; j++) {
      await prisma.comment.create({
        data: {
          postId: post.id,
          userId: allUsers[randomInt(0, allUsers.length - 1)].id,
          content: randomItem([
            'Amen ! 🙏',
            'Gloire à Dieu !',
            'Merci pour ce partage.',
            'Je prie avec toi.',
            'Que Dieu te bénisse !',
            'Alléluia !',
            'Très encourageant.',
          ])
        }
      });
    }

    // Add likes
    for (let k = 0; k < post.likesCount; k++) {
      await prisma.like.create({
        data: {
          postId: post.id,
          userId: allUsers[k % allUsers.length].id,
        }
      });
    }
  }
  console.log('   Created community posts');

  // Create Conversions (New Converts)
  console.log('\n✝️ Creating conversions/follow-ups...');
  
  for (let i = 0; i < 10; i++) {
    const conversion = await prisma.conversion.create({
      data: {
        churchId: church.id,
        firstName: randomItem(FIRST_NAMES),
        lastName: randomItem(LAST_NAMES),
        phone: `+243 ${randomInt(800, 999)} ${randomInt(100000, 999999)}`,
        conversionDate: randomDate(new Date('2024-01-01'), new Date()),
        location: randomItem(['Temple Principal', 'Croisade Place Nationale', 'Visite à domicile', 'Évangélisation rue']),
        assignedToId: allUsers[randomInt(0, 4)].id,
        status: randomItem(['NEW_CONTACT', 'FIRST_FOLLOW_UP', 'IN_PROGRESS', 'BIBLE_STUDY', 'READY_FOR_INTEGRATION', 'INTEGRATED'] as any[]),
        notes: null,
      }
    });

    // Add follow-ups
    if (Math.random() > 0.3) {
      await prisma.pastoralFollowUp.create({
        data: {
          conversionId: conversion.id,
          userId: allUsers[randomInt(0, 4)].id,
          type: 'VISIT',
          notes: 'Premier contact effectué. Personne receptive.',
          nextAction: 'Planifier étude biblique',
          followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }
      });
    }
  }
  console.log('   Created conversions');

  // Create Baptisms
  console.log('\n💧 Creating baptisms...');
  
  for (let i = 0; i < 5; i++) {
    await prisma.baptism.create({
      data: {
        churchId: church.id,
        candidateId: allUsers[randomInt(5, allUsers.length - 1)].id,
        requestDate: randomDate(new Date('2024-01-01'), new Date()),
        scheduledDate: randomDate(new Date(), new Date('2025-03-01')),
        officiantId: allUsers[0].id, // Pastor
        status: randomItem(['REQUESTED', 'APPROVED', 'SCHEDULED', 'COMPLETED'] as any[]),
        notes: null,
      }
    });
  }
  console.log('   Created baptisms');

  // Create Courses
  console.log('\n📖 Creating courses...');
  
  for (let i = 0; i < 3; i++) {
    const course = await prisma.course.create({
      data: {
        churchId: church.id,
        title: randomItem([
          'Fondements de la Foi',
          'Vie de Disciple',
          'Leadership Chrétien'
        ]),
        description: 'Un cours complet pour approfondir votre compréhension de la foi chrétienne.',
        instructorId: allUsers[randomInt(0, 4)].id,
        status: 'PUBLISHED',
        maxStudents: 50,
      }
    });

    // Add modules
    for (let j = 0; j < 4; j++) {
      const module_ = await prisma.courseModule.create({
        data: {
          courseId: course.id,
          title: `Module ${j + 1}: ${randomItem(['Introduction', 'Les Fondements', 'La Prière', 'La Parole', 'Le Service'])}`,
          description: `Description du module ${j + 1}`,
          order: j + 1,
        }
      });

      // Add lessons to module
      for (let k = 0; k < 3; k++) {
        await prisma.lesson.create({
          data: {
            moduleId: module_.id,
            title: `Leçon ${k + 1}: ${randomItem(['Introduction', 'Développement', 'Application', 'Conclusion'])}`,
            content: 'Contenu de la leçon ici...',
            duration: `${randomInt(15, 45)} min`,
            order: k + 1,
          }
        });
      }
    }

    // Add enrollments
    for (let m = 0; m < randomInt(10, 30); m++) {
      await prisma.enrollment.create({
        data: {
          courseId: course.id,
          userId: allUsers[randomInt(0, allUsers.length - 1)].id,
          progress: randomInt(0, 100),
          enrolledAt: randomDate(new Date('2024-06-01'), new Date()),
          completedAt: Math.random() > 0.7 ? new Date() : null,
        }
      });
    }
  }
  console.log('   Created courses with modules and enrollments');

  console.log('\n✅ Database seeding completed successfully!');
  console.log('\n📋 Demo Accounts:');
  console.log('─────────────────────────────────────────────');
  DEMO_USERS.forEach(u => {
    console.log(`   🔑 ${u.email} / ${u.password} (${u.role})`);
  });
  console.log('─────────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
