import { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import busboy from 'busboy'
import { getSupabaseAnon } from '~/lib/api/utils'

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

  const { id, project_id } = req.query;
  console.log('imageUrl - getting ', id, 'for project', project_id);
  try {
    //@TODO: validate image product / user / etc.
    // @ts-ignore
    const suabaseAnon = getSupabaseAnon();

    const { data: testData } = await suabaseAnon.storage
      .from('images')
      .download(`${project_id}/${id}`);
    console.log('---- downloaded image:', testData);

    const { data, error } = await suabaseAnon.storage
      .from('images')
      .createSignedUrl(`${project_id}/${id}`, 60 * 60 * 24) //@TODO: assert user id in url

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
