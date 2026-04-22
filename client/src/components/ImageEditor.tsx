import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface ImageEditorProps {
  image: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
  aspect?: number;
}

export default function ImageEditor({
  image,
  onCropComplete,
  onCancel,
  aspect = 1,
}: ImageEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteInternal = useCallback(
    (_croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = async () => {
    try {
      if (!croppedAreaPixels) return;
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[600px] bg-zinc-950 border-zinc-800 text-white p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Редактирование изображения</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <div className="relative h-[400px] w-full bg-zinc-900 rounded-lg overflow-hidden">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={onCropChange}
              onCropComplete={onCropCompleteInternal}
              onZoomChange={onZoomChange}
            />
          </div>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Масштаб
                </label>
                <span className="text-xs text-zinc-500">{zoom.toFixed(1)}x</span>
              </div>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0])}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter className="mt-8 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900"
            >
              Отмена
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-8"
            >
              Сохранить
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
