/** Génère un petit fichier WAV de test (2 s, 440 Hz) pour l'upload audio. */
declare const Bun: { write(path: string, data: Buffer): Promise<unknown> };

const sampleRate = 8000;
const seconds = 2;
const samples = sampleRate * seconds;
const dataSize = samples * 2;
const buffer = Buffer.alloc(44 + dataSize);

buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20); // PCM
buffer.writeUInt16LE(1, 22); // mono
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * 2, 28);
buffer.writeUInt16LE(2, 32);
buffer.writeUInt16LE(16, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(dataSize, 40);

for (let i = 0; i < samples; i++) {
  const value = Math.round(12000 * Math.sin((2 * Math.PI * 440 * i) / sampleRate));
  buffer.writeInt16LE(value, 44 + i * 2);
}

await Bun.write("/tmp/test-sermon.wav", buffer);
console.log("Fichier test : /tmp/test-sermon.wav (" + buffer.length + " octets)");

export {};
