import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { PKPass } from 'passkit-generator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const modelPath = path.join(process.cwd(), 'pass-model');
    
    // Initialize the PKPass generator
    const pass = await PKPass.from(modelPath, {
      certificates: {
        wwdr: fs.readFileSync(path.join(process.cwd(), 'certs/wwdr.pem')),
        signerCert: fs.readFileSync(path.join(process.cwd(), 'certs/pass-cert.pem')),
        signerKey: fs.readFileSync(path.join(process.cwd(), 'certs/key.pem')),
        password: process.env.PASS_PHRASE || '', // Use .env for passphrase
      },
      // Add custom field overrides
      overrides: {
        serialNumber: `user-${Date.now()}`,
        description: 'Business Card',
        organizationName: 'Your App Name',
        labelColor: '#000000',
        foregroundColor: '#ffffff',
        backgroundColor: '#2f2f2f',
        generic: {
          primaryFields: [
            { key: 'name', label: 'Name', value: 'John Doe' },
          ],
          secondaryFields: [
            { key: 'email', label: 'Email', value: 'john@example.com' },
          ]
        }
      }
    });

    // Generate the pass as a buffer
    const buffer = await pass.getAsBuffer();

    // Set response headers for downloading the pass
    res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
    res.setHeader('Content-Disposition', 'attachment; filename=card.pkpass');

    // Send the pass buffer as response
    res.send(buffer);
  } catch (error) {
    console.error('Pass generation failed:', error);
    res.status(500).json({ error: 'Failed to generate pass' });
  }
}
