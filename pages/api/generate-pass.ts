import fs from 'fs';
import path from 'path';
import { PKPass } from 'passkit-generator';
import { db, doc, getDoc } from '../../utils/firebaseConfig'; // Import Firestore from your config file
import { NextApiRequest, NextApiResponse } from 'next'; // Import Next.js types

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Extract cardId from the URL parameter (e.g., /card/[cardId])
  const { cardId } = req.query;

  // Log the cardId to make sure it's being passed correctly
  console.log('Received cardId from URL:', cardId);

  // Check if cardId is provided
  if (!cardId) {
    return res.status(400).json({ error: 'cardId is required' });
  }

  try {
    // Fetch card data from Firestore using cardId
    const cardRef = doc(db, 'cards', cardId as string); // Type cardId as string
    const cardDoc = await getDoc(cardRef);

    if (!cardDoc.exists()) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const cardData = cardDoc.data();

    // Define path to certificates and pass model
    const certsPath = path.join(process.cwd(), 'certs');
    const passModelPath = path.join(process.cwd(), 'passModels', 'businessCard.pass');

    // Create a new pass object
    const pass = await PKPass.from({
      model: passModelPath,
      certificates: {
        signerCert: fs.readFileSync(path.join(certsPath, 'passwallet.pem')),
        signerKey: fs.readFileSync(path.join(certsPath, 'pass-key.pem')),
        wwdr: fs.readFileSync(path.join(certsPath, 'wwdr.pem')),
        signerKeyPassphrase: process.env.CERT_PASSWORD || 'your_certificate_password',
      },
    });

    // Ensure pass object is correctly initialized
    if (!pass) {
      throw new Error('Failed to initialize the pass object');
    }

    // Set header fields
    pass.headerFields.push(
      {
        key: "header1",
        label: "Data",
        value: "25 mag", // You can change this to dynamic data if needed
        textAlignment: "PKTextAlignmentCenter",
      },
      {
        key: "header2",
        label: "Volo",
        value: "EZY997", // You can change this to dynamic data if needed
        textAlignment: "PKTextAlignmentCenter",
      }
    );

    // Add primary fields using data from Firestore
    pass.primaryFields.push(
      {
        key: 'name',
        label: 'Name',
        value: `${cardData.firstName} ${cardData.lastName}`, // Dynamically use first and last name from Firestore
      },
      {
        key: 'email',
        label: 'Email',
        value: cardData.email || 'example@example.com', // Use email from Firestore or fallback to a default
      }
    );

    // Add secondary fields (optional, based on available card data)
    pass.secondaryFields.push(
      {
        key: 'title',
        label: 'Title',
        value: cardData.title || 'Not Provided',
      }
    );

    // Add auxiliary fields
    pass.auxiliaryFields.push(
      {
        key: 'phone',
        label: 'Phone',
        value: cardData.phone || 'Not Provided',
      }
    );

    // Generate .pkpass buffer
    const pkpassBuffer = await pass.getAsBuffer();

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Write file
    const passFilePath = path.join(outputDir, 'businessCard.pkpass');
    fs.writeFileSync(passFilePath, pkpassBuffer);

    res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
    res.setHeader('Content-Disposition', 'attachment; filename=businessCard.pkpass');
    // Respond with success
    res.status(200).json({
      message: 'Pass generated successfully',
      filePath: '/output/businessCard.pkpass',
    });
  } catch (error) {
    console.error('Error generating pass:', error);
    res.status(500).json({ error: 'Failed to generate pass' });
  }
}
