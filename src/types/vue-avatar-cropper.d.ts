declare module "vue-avatar-cropper" {
  import { DefineComponent } from "vue";

  const AvatarCropper: DefineComponent<{
    trigger?: boolean;
    uploadHandler?: (file: File) => Promise<any>;
    cropperOptions?: Record<string, any>;
    outputOptions?: { width: number; height: number };
    outputMime?: string;
    outputQuality?: number;
    mimes?: string;
    labels?: Record<string, string>;
    inline?: boolean;
  }>;

  export default AvatarCropper;
}
