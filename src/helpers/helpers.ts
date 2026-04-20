import { fetchSignedUrl } from "../api/presign";

const PUBLIC_CDN = import.meta.env.VITE_PUBLIC_CDN

export const getFileUrl = (object_key: string, visibility: string): string => {

    if (visibility === "public") {
        return `${PUBLIC_CDN}/${object_key}`;
    }

    fetchSignedUrl(object_key).then((res) => {
        return res.data.url
    }).catch((e) => {
        throw e
    });
    return ""

};

const LIMITS = {
    image: {
        maxCount: 5,
        maxSize: 5 * 1024 * 1024,
        types: ["image/jpeg", "image/png", "image/webp"],
    },
    video: {
        maxCount: 1,
        maxSize: 50 * 1024 * 1024,
        maxDuration: 60 * 10, // 10 minutes (seconds)
        types: ["video/mp4", "video/webm"],

    },
    audio: {
        maxCount: 1,
        maxSize: 15 * 1024 * 1024,
        maxDuration: 10 * 60, // 10 minutes (seconds)
        types: ["audio/mpeg", "audio/wav", "audio/ogg"],
    },
};

export const validateFiles = (files: File[]) => {
    let imageCount = 0;
    let videoCount = 0;
    let audioCount = 0;

    files.forEach(file => {
        if (LIMITS.image.types.includes(file.type)) {
            imageCount++;
            if (file.size > LIMITS.image.maxSize) {
                throw new Error("Image too large (max 5MB)");
            }
        }
        else if (LIMITS.video.types.includes(file.type)) {
            videoCount++;
            if (file.size > LIMITS.video.maxSize) {
                throw new Error("Video too large (max 50MB)");
            }
        }
        else if (LIMITS.audio.types.includes(file.type)) {
            audioCount++;
            if (file.size > LIMITS.audio.maxSize) {
                throw new Error("Audio too large (max 15MB)");
            }
        }
        else {
            throw new Error(`Unsupported file type: ${file.type}`);
        }
    });

    if (imageCount > LIMITS.image.maxCount) {
        throw new Error("Maximum 5 images allowed");
    }

    if (videoCount > LIMITS.video.maxCount) {
        throw new Error("Only 1 video allowed");
    }

    if (audioCount > LIMITS.audio.maxCount) {
        throw new Error("Only 1 audio file allowed");
    }
};

const getMediaDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);

        const media = file.type.startsWith("audio")
            ? new Audio()
            : document.createElement("video");

        media.preload = "metadata";
        media.src = url;

        media.onloadedmetadata = () => {
            URL.revokeObjectURL(url);
            resolve(media.duration);
        };

        media.onerror = () => {
            reject(new Error("Failed to load media metadata"));
        };
    });
};


export const validateMediaDuration = async (files: File[]) => {
    for (const file of files) {
        if (LIMITS.audio.types.includes(file.type)) {
            const duration = await getMediaDuration(file);

            if (duration > LIMITS.audio.maxDuration) {
                throw new Error("Audio must not exceed 10 minutes");
            }
        }

        if (LIMITS.video.types.includes(file.type)) {
            const duration = await getMediaDuration(file);
            if (duration > LIMITS.video.maxDuration) {
                throw new Error("Video must not exceed 10 minutes");
            }
        }
    }
};