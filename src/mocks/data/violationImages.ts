import type { ViolationType } from "@/types/violation";

const VIOLATION_IMAGES: Record<ViolationType, string[]> = {
  "overspeeding": [
    "/image%20violation/overspeeding/overspeeding1.jpg",
    "/image%20violation/overspeeding/overspeeding2.jfif",
    "/image%20violation/overspeeding/overspeeding3.jfif",
    "/image%20violation/overspeeding/overspeeding4.jfif",
    "/image%20violation/overspeeding/overspeeding5.jfif",
  ],

  "wrong-way": [
    "/image%20violation/wrong%20way/wrong%20way1.jfif",
    "/image%20violation/wrong%20way/wrong%20way2.jpg",
  ],

  "no-helmet": [
    "/image%20violation/no%20helmet/no%20helmet1.jpg",
    "/image%20violation/no%20helmet/no%20helmet2.jpg",
    "/image%20violation/no%20helmet/no%20helmet3.jfif",
    "/image%20violation/no%20helmet/no%20helmet4.jpg",
    "/image%20violation/no%20helmet/no%20helmet5.jfif",
    "/image%20violation/no%20helmet/no%20helmet6.jfif",
    "/image%20violation/no%20helmet/no%20helmet7.jpg",
    "/image%20violation/no%20helmet/no%20helmet8.jfif",
    "/image%20violation/no%20helmet/no%20helmet9.jfif",
    "/image%20violation/no%20helmet/no%20helmet10.jfif",
  ],

  "red-light-jump": [
    "/image%20violation/red%20light%20jump/red%20light%20jump1.jfif",
    "/image%20violation/red%20light%20jump/red%20light%20jump2.jpeg",
  ],

  "rash-driving": [
    "/image%20violation/rash%20driving/rash%20driving1.jfif",
    "/image%20violation/rash%20driving/rash%20driving2.jpg",
    "/image%20violation/rash%20driving/rash%20driving3.jfif",
    "/image%20violation/rash%20driving/rash%20driving4.jpg",
  ],
};

const PLATE_IMAGES = [
  "/image%20violation/plates/plate1.jpg",
  "/image%20violation/plates/plate2.jfif",
  "/image%20violation/plates/plate3.jpg",
  "/image%20violation/plates/plate4.png",
  "/image%20violation/plates/plate5.png",
  "/image%20violation/plates/plate6.jpg",
  "/image%20violation/plates/plate7.jfif",
];

const violationImageCounters: Record<ViolationType, number> = {
  overspeeding: 0,
  "wrong-way": 0,
  "no-helmet": 0,
  "red-light-jump": 0,
  "rash-driving": 0,
};

let plateImageCounter = 0;

export function getViolationImage(type: ViolationType): string {
  const images = VIOLATION_IMAGES[type];
  const index = violationImageCounters[type] % images.length;

  violationImageCounters[type]++;

  return images[index];
}

export function getPlateImage(): string {
  const index = plateImageCounter % PLATE_IMAGES.length;

  plateImageCounter++;

  return PLATE_IMAGES[index];
}