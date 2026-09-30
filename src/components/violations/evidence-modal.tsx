"use client";

import { Play, Video } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface EvidenceMedia {
  title: string;
  imageUrl: string;
  videoUrl?: string;
  videoLabel?: string;
}

export function EvidenceModal({
  media,
  onClose,
}: {
  media: EvidenceMedia | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!media} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        {media && (
          <>
            <DialogHeader>
              <DialogTitle>{media.title}</DialogTitle>
              <DialogDescription>Evidence captured by the vehicle camera system.</DialogDescription>
            </DialogHeader>
            {media.videoUrl ? (
              <Tabs defaultValue="snapshot">
                <TabsList>
                  <TabsTrigger value="snapshot">
                    <Play className="mr-1 h-3.5 w-3.5" /> Snapshot
                  </TabsTrigger>
                  <TabsTrigger value="clip">
                    <Video className="mr-1 h-3.5 w-3.5" /> Video clip
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="snapshot">
                  <img src={media.imageUrl} alt={media.title} className="mx-auto max-h-[60vh] rounded-md border" />
                </TabsContent>
                <TabsContent value="clip">
                  <video controls className="mx-auto max-h-[60vh] w-full rounded-md border" preload="metadata" playsInline>
                    <source src={media.videoUrl} />
                    Your browser does not support video playback.
                  </video>
                </TabsContent>
              </Tabs>
            ) : (
              <img src={media.imageUrl} alt={media.title} className="mx-auto max-h-[60vh] rounded-md border" />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}