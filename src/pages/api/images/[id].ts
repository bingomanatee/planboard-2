import { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import busboy from 'busboy'
import { getSupabaseAnon } from '~/lib/api/utils'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method?.toUpperCase()) {

    case 'PUT':
      return save(req, res);
      break;

    default:
      res.status(500).send({ error: 'bad method' })
  }
}

export const config = {
  api: {
    bodyParser: false
  }
}

export async function save(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const { id } = req.query;

  let fields = {};
  let contentType = '';
  let image = null;

  try {
    const supabase = createServerSupabaseClient({ req, res })
    // Check if we have a session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const suabaseAnon = getSupabaseAnon();

    const bb = busboy({ headers: req.headers });
    bb.on('file', (name, file, info) => {
      if (name === 'image') {
        const { filename, encoding, mimeType } = info;
        contentType = info.mimeType;
        let buffer: Buffer | null = null;
        console.log(
          `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
          filename,
          encoding,
          mimeType
        );
        file.on('data', (data: Buffer) => {
          buffer = buffer ? Buffer.concat([buffer, Buffer.from(data)]) : Buffer.from(data);
        }).on('close', () => {
          image = buffer;
        });
      }

    });
    bb.on('field', (name, val, info) => {
      fields[name] = val;
    });
    bb.on('close', async () => {
      console.log('--------- done reading form data:');
      if(!image) {
        throw new Error('no image data found');
      }
      console.log('fields:', fields);

      const { project_id, contentType } = fields;
      if (!project_id) {
        throw new Error('project not listed')
      }
      // @TODO: validate project

      // @ts-ignore
      const { error } = await suabaseAnon.storage.from('images')
        .upload(`${project_id}/${id}`, image, { contentType, upsert: true });
      if (error) throw error;
      res.send({ fields });
    });
    req.pipe(bb);

  } catch (err) {
    console.log('image error: ', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'cannot save' });
  }
}
