/**
 * Arche d'Amour - Check Group Membership API Route
 * GET /api/groupes/[groupId]/members/[userId]
 * 
 * Checks if a user is a member of a specific group
 * Used by WebSocket service for permission validation (SEC-010)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

interface RouteParams {
  groupId: string;
  userId: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { groupId, userId } = await params;

    // Validate parameters
    if (!groupId || !userId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'groupId et userId sont requis' },
        { status: 400 }
      );
    }

    // Check if user is a member of the group
    const groupMember = await db.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!groupMember) {
      logger.info({ userId, groupId, event: 'group_membership_check' }, 'Utilisateur n\'est pas membre du groupe');
      return NextResponse.json(
        { 
          isMember: false,
          message: 'L\'utilisateur n\'est pas membre de ce groupe' 
        },
        { status: 200 }
      );
    }

    logger.info({ userId, groupId, event: 'group_membership_check' }, 'Utilisateur est membre du groupe');
    
    return NextResponse.json(
      {
        isMember: true,
        role: groupMember.role,
        joinedAt: groupMember.joinedAt,
        message: 'L\'utilisateur est membre de ce groupe',
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error({ error, event: 'group_membership_check_error' }, 'Erreur lors de la vérification de l\'appartenance au groupe');
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Une erreur est survenue lors de la vérification' 
      },
      { status: 500 }
    );
  }
}
