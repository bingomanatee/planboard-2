import axios from 'axios'

// gets a transient image url for tn id/project pair.

// @TODO: cache

export default async function checkImageUrl(id, project_id) {
  const { data } = await axios.get(`/api/imageUrl/${project_id}/${id}`);
  if (data?.image_url) {
    return data.image_url
  } else {
    throw new Error('no image_url on returned data');
  }
}
