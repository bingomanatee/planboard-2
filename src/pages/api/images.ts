import { NextApiRequest, NextApiResponse } from 'next'
import { toData } from '~/api/utils'
// import { SupabaseClient } from '@supabase/supabase-js'
import busboy from 'busboy';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method?.toUpperCase()) {

    case 'POST':
      return create(req, res);
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

export async function create(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let fields = {};
  let contentType = '';
  let image = null;
  try {
    console.log('---- image/create');
    const supabase = createServerSupabaseClient({ req, res })
    // Check if we have a session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log('session retrieved', session);
    res.send({saved: true})
    return;

    const ct = req.headers['content-type'];
    if (!ct) {
      throw new Error('no ct');
    }
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

      const { project, item_id } = fields;
      if (!project) {
        throw new Error('project not listed')
      }

      // @ts-ignore
      const data = await toData(supabase.storage.from('images')
        .upload(`${project}/${item_id}`, image, { contentType, upsert: true }));
      res.send({ data });
    });
    req.pipe(bb);

  } catch (err) {
    console.log('image error: ', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'cannot save' });
  }
}

/*

export async function patchItemOrder(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: SupabaseClient,
  projectId: string,
  itemOrder: { id: string, order: number }[]
) {
  const items = await toData<{ id: string }[]>(supabase.from('project_item')
    .select('id')
    .eq('project', projectId))

  const itemIds = items.map(({ id }) => id);

  const validItemOrders = itemOrder.filter(({ id }) => itemIds.includes(id))

  console.log('updating item orders:', validItemOrders);

  for (let itemPair of validItemOrders) {
    console.log('setting order of item', itemPair.id, 'in', projectId, 'to', itemPair.order);
    await supabase.from('project_item')
      .update({ order: itemPair.order })
      .eq('project', projectId)
      .eq('id', itemPair.id);
  }

  const newItems = await toData<Item[]>(supabase.from('project_item')
    .select()
    .eq('project', projectId));

  res.send({ project_item: newItems });
}

export async function patch(
  req: NextApiRequest,
  res: NextApiResponse,
) {

  const supabase = getSupabase();
  const {
    nonce,
    user_id,
  } = req.headers;

  try {
    if (!nonce && user_id) {
      throw new Error('Un-authenticated nonce');
    }
    await validateNonce(user_id as string, nonce as string, supabase);

    if ('project' in req.body && 'item_orders' in req.body) {
      await validateProject(req.body.project, user_id, supabase);
      await patchItemOrder(req, res, supabase, req.body.project, req.body.item_orders);
    } else {
      res.status(500).send({ error: 'bad body', body: req.body })
    }
  } catch (err) {
    console.log('load error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'cannot save' });
  }
}
*/
