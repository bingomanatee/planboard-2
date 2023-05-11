import { leafI } from '@wonderlandlabs/forest/lib/types'
import { RefObject } from 'react'
import { Content, ImageData } from '~/types'
import axios from 'axios'
import getImageUrl from '~/components/utils/getImageUrl'

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
 *
 * There are three scenarios here:
 *
 * 1. The first time (ane every time until an image is uplaoded)
 *    the form is visited there is no image in buckets --
 *    saved = false,
 *    uploaded = false.
 *
 *    a: If the form is completed without uploading a file, uploaded is still false
 *       and the commitFile action will not be called. saved remains false.
 *    b: If a file Is uploaded, when the form is committed, upload is true, and
 *       commitFile will be called at which point, saved will be set to true.
 *
 *  2. Once an image is uploaded, saved is true.
 *     however unless a _substitute_ image is uploaded, upload will remain false.
 *     In this scenario, the image URL is retrieved and attached to the displayImage
 *     which is a meta property of this state.
 */



const imageDataState = (
  dataState: leafI,
  contentData: ImageData, // found from the image.forContent call made in the datastore.frameInfo() method;
  content: Content) => {
  console.log('imageDataState: contentData = ', contentData, 'content = ', content);
  const $value = {
    width: 0,
    height: 0,
    filename: '',
    zoom: 1,
    syncSize: !!contentData.syncSize,
    saved: contentData.saved,
    uploaded: false,
    ...(contentData || {}), // will override most of these values
    content_id: content.id,
    project_id: content.project_id
  };
  return (
    {
      name: 'contentData', $value,
      actions: {
        reUpload(imageState: leafI) { // upload again button clicked
          imageState.do.set_saved(false);
          imageState.do.set_uploaded(false);

          imageState.do.set_width(0);
          imageState.do.set_height(0);
          imageState.do.set_zoom(1);
          imageState.do.set_filename('');

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
                imageState.do.set_uploaded(true);
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
          const { project_id, id } = imageState.value;

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
          imageState.do.set_saved(true);
        },
        async load(imageState: leafI) {
          const { id, project_id } = imageState.value;
          try {
            const url = await getImageUrl(id, project_id);
            const displayImage = imageState.getMeta('displayImage');
            console.log('displayImage: ', displayImage, 'url:', url, 'state: ', imageState);
            if (displayImage && url) {
              displayImage.current.src = url;
            }
          } catch (err) {
            console.warn('cannot get image url');
          }
        },
        async commit(imageState: leafI) {

          if (imageState.value.uploaded) {
            await imageState.do.commitFile();
          }
          const { width, height, content_id, project_id, id, syncSize, uploaded, saved } = imageState.value;

          const newImageContent = {
            ...contentData,
            width,
            height,
            content_id,
            project_id,
            id,
            syncSize,
            saved
          };
          const imageStore = dataState.child('images')!;
          console.log('saving ', newImageContent, 'to', id);
          imageStore.do.add(newImageContent, id);
          await imageStore.do.save(id);
          if (syncSize && width && height && saved) {
            dataState.do.setFrameSize(content.frame_id, width, height);
          }
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
