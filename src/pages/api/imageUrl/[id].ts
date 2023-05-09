import { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method?.toUpperCase()) {
    case 'GET':
      return load(req, res);
      break;

    default:
      res.status(500).send({ error: 'bad method' })
  }
}

export async function load(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const { id } = req.query;

  try {
    //@TODO: validate image product / user / etc.
    // @ts-ignore
    const supabase = createServerSupabaseClient({ req, res })

    const { data, error } = await (supabase
        .storage
        .from('images')
        .createSignedUrl(`${id}`, 60 * 60 * 24) //@TODO: assert user id in url
    );
    if (error) {
      throw error;
    }
    if (!data) {
      throw new Error('cannot get image data');
    }

    const { signedUrl } = data;
    res.status(200).send({ image_url: signedUrl })

  } catch (err) {
    console.log('imageLoad error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : `cannot load ${id}` });
  }
}
