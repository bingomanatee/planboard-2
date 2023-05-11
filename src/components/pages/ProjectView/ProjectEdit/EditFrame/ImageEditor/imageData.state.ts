import { leafI } from '@wonderlandlabs/forest/lib/types'
import { RefObject } from 'react'
import { Content, ImageData } from '~/types'
import axios from 'axios'

const EXTENSION_MAP = new Map([
    ['gif', 'image/gif'],
    ['jpg', ' image/jpeg'],
    ['jpeg', ' image/jpeg'],
    ['png', 'image/png'],
    ['svg', 'image/svg+xml']
  ]
);

/**
 * this is the "child state" for content detail if the frame is an image type;
 * it accepts fields that are polled by dataStore's frameInfo(id) method.
 * @param contentData
 * @param contentData
 * @param content
 */

const imageDataState = (
  dataState: leafI,
  contentData: ImageData,
  content: Content) => {
  console.log('imageDataState: contentData = ', contentData, 'content = ', content);
  const $value = {
    width: 0,
    height: 0,
    filename: '',
    syncSize: false,
    saved: false,
    ...(contentData || {}), // will override most of these values
    content_id: content.id,
    project_id: content.project_id
  };
  return (
    {
      name: 'contentData', $value,
      actions: {
        reUpload(imageState: leafI) {
          imageState.value = { ...imageState.value, saved: false, filename: '' };
          imageState.setMeta('fileObj', null, true);
        },
        onFileChange(imageState: leafI,
                     e: MouseEvent, { files }: { files: File[] }) {
          const file = files[0];
          console.log('onFileChanged: file is', file);
          if (!file) {
            console.log('onFileChanged: no file');
            imageState.setMeta('fileObj', null, true);
            imageState.setMeta('fileReader', null, true);
            return;
          }
          imageState.setMeta('fileObj', file, true);

          const displayImage: RefObject<HTMLImageElement> = imageState.getMeta('displayImage');
          const reader = new FileReader();
          imageState.do.set_filename(file.name);

          reader.onload = function () {
            if (displayImage.current && reader.result) {
              // @ts-ignore
              displayImage.current.src = reader.result;
              setTimeout(() => {
                imageState.do.set_width(displayImage.current?.width || 0);
                imageState.do.set_height(displayImage.current?.height || 0);
                imageState.do.set_saved(true);
              });
            } else {
              console.log('problem with reader/displayImage: ', reader, displayImage)
            }
          };
          reader.readAsDataURL(file);
          imageState.setMeta('fileReader', reader, true);
        },
        async commitFile(imageState: leafI) {
          const formData = new FormData();
          const { width, height, content_id, project_id, id, saved } = imageState.value;

          const image = imageState.getMeta('fileObj')

          formData.append('project_id', project_id);
          formData.append('contentType', imageState.$.contentType());
          formData.append("image", image);

          const path = '/api/images/' + id;

          const props = {
            method: 'put',
            url: path,
            data: formData,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }

          await axios(props);
        },
        async commit(imageState: leafI) {
          const { width, height, content_id, project_id, id, syncSize, saved } = imageState.value;

          if (saved) {
            await imageState.do.commitFile();
          }

          const newImageContent = { ...contentData, width, height, content_id, project_id, id, syncSize, saved };
          const imageStore = dataState.child('images')!;
          console.log('saving ', newImageContent, 'to', id);
          imageStore.do.add(newImageContent, id);
          await imageStore.do.save(id);
        }
      },
      selectors: {
        extension(leaf: leafI) {
          const { filename } = leaf.value;
          if (!filename) {
            return false;
          }
          try {
            const fileNameParts = filename.split('.')
            let ext = fileNameParts.pop();
            return ext.toLowerCase();
          } catch (err) {
            return '';
          }
        },
        contentType(imageState: leafI, size: string) {
          const extension = imageState.$.extension();
          if (EXTENSION_MAP.has(extension)) {
            return EXTENSION_MAP.get(extension);
          }
          return '';
        },
      }
    })
}

export default imageDataState;
