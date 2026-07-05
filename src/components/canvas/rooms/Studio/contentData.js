/**
 * Studio Content Data
 * 
 * This file contains all content items for the Studio monitor tower.
 * Each item will be displayed on a monitor in the tower.
 * 
 * Platforms: 'web', 'ai_cyber', 'iot'
 */

export const PLATFORM_CONFIG = {
    web: {
        color: '#4A90D9',
        accentColor: '#2d6cb5',
        icon: '💻',
        label: 'Web Stack',
        shape: 'monitor', // Thin desktop monitor
    },
    ai_cyber: {
        color: '#FF0000',
        accentColor: '#cc0000',
        icon: '🧠',
        label: 'AI & CyberSec',
        shape: 'tv', // Wide CRT style
    },
    iot: {
        color: '#00F2EA',
        accentColor: '#FF0050',
        icon: '🔌',
        label: 'IoT & Hardware',
        shape: 'phone', // Vertical phone
    },
};

const RAW_CONTENT_DATA = [
    // ============ Product Systems (Monitor) ============
    {
        id: 'studio-kivora',
        platform: 'web',
        title: 'Kivora',
        description: 'A private SaaS product for managing social media service orders. It represents my product-side work: account flow, ordering logic, balance handling, service catalogs, and operational dashboards.',
        frontTexture: '/textures/studio/monitorfront_kivora.webp',
        paintedFrontTexture: '/textures/studio/monitorfront_kivora_painted.webp',
        thumbnail: null,
        url: '#',
        actionLabel: 'COMING SOON',
        date: '2026-02-08',
        readTime: 'Private SaaS',
    },
    {
        id: 'studio-cdn-panel',
        platform: 'web',
        title: 'CDN Panel',
        description: 'A personal file management panel inspired by cloud drive workflows. The project focuses on uploads, previews, access control, file organization, and making private storage feel simple to use.',
        frontTexture: '/textures/studio/monitorfront_cdn.webp',
        paintedFrontTexture: '/textures/studio/monitorfront_cdn_painted.webp',
        thumbnail: null,
        url: 'https://github.com/RDTUTORIAL/cdn',
        date: '2026-01-30',
        readTime: 'Storage System',
    },
    {
        id: 'studio-barcode-receipt',
        platform: 'web',
        title: 'Barcode & Receipt Tool',
        description: 'A utility app for scanning barcodes and printing barcode labels or receipts. It fits the practical systems side of my work: input scanning, quick lookup, printable output, and small business workflows.',
        frontTexture: '/textures/studio/monitorfront_intimasscan.webp',
        paintedFrontTexture: '/textures/studio/monitorfront_intimasscan_painted.webp',
        thumbnail: null,
        url: '#',
        actionLabel: 'PRIVATE',
        date: '2026-01-18',
        readTime: 'POS Utility',
    },

    // ============ Security and Tooling Lab (TV) ============
    {
        id: 'studio-dllencrypt',
        platform: 'ai_cyber',
        title: 'dllencrypt',
        description: 'A file-hiding and encryption experiment that studies how data can be packed into DLL-like containers. It is a small security research project around obfuscation, encoding, and controlled file handling.',
        frontTexture: '/textures/studio/tvfront_dllencrypt.webp',
        paintedFrontTexture: '/textures/studio/tvfront_dllencrypt_painted.webp',
        thumbnail: null,
        url: 'https://github.com/RDTUTORIAL/DLLCrypt',
        date: '2026-01-26',
        duration: 'Security Lab',
    },
    {
        id: 'studio-eduscan',
        platform: 'ai_cyber',
        title: 'eduscan',
        description: 'A web-based security learning toolkit with many scanning utilities and payload references for authorized testing. The focus is education, repeatable checks, and organizing security workflows in one place.',
        frontTexture: '/textures/studio/tvfront_eduscan.webp',
        paintedFrontTexture: '/textures/studio/tvfront_eduscan_painted.webp',
        thumbnail: null,
        url: 'https://github.com/RDTUTORIAL/Eduscan',
        date: '2026-01-24',
        duration: '55+ Tools',
    },
    {
        id: 'studio-aetherion',
        platform: 'ai_cyber',
        title: 'Aetherion',
        description: 'An Android and ADB research toolkit for lab environments. It explores device discovery, connection workflows, diagnostics, and controlled security testing against owned or authorized devices.',
        frontTexture: '/textures/studio/tvfront_aetherion.webp',
        paintedFrontTexture: '/textures/studio/tvfront_aetherion_painted.webp',
        thumbnail: null,
        url: 'https://github.com/RDTUTORIAL/aetherion',
        date: '2026-01-21',
        duration: 'ADB Lab',
    },

    // ============ Hardware and Private Experiments (Phone) ============
    {
        id: 'studio-ghostusb',
        platform: 'iot',
        title: 'GhostUSB',
        description: 'A lab-only ESP32-S2/S3 firmware project for studying USB HID behavior and endpoint defense. It is framed as authorized hardware security research, with emphasis on testing safely in controlled environments.',
        frontTexture: '/textures/studio/phonefront_ghostusb.webp',
        paintedFrontTexture: '/textures/studio/phonefront_ghostusb_painted.webp',
        thumbnail: null,
        url: 'https://github.com/RDTUTORIAL/GhostUSB',
        date: '2026-01-19',
        likes: 'Hardware Lab',
    },
    {
        id: 'studio-penjor-game',
        platform: 'iot',
        title: 'Ayo Buat Penjor',
        description: 'A private cultural game prototype about assembling a Balinese penjor through small interactive steps. It is more personal than commercial: a playful way to turn local culture into a game idea.',
        frontTexture: '/textures/studio/phonefront_ayobuatpenjor.webp',
        paintedFrontTexture: '/textures/studio/phonefront_ayobuatpenjor_painted.webp',
        thumbnail: null,
        url: '#',
        actionLabel: 'PRIVATE',
        date: '2026-01-12',
        likes: 'Game Prototype',
    },
];

const webTextures = ['/textures/studio/monitorfront_postnafbdoublewinner.webp'];
const webPaintedTextures = ['/textures/studio/monitorfront_postnafbdoublewinner_painted.webp'];
const aiTextures = ['/textures/studio/tvfront_filmikprojektdlamultiego.webp', '/textures/studio/tvfront_filmikedytowaniezdjec.webp'];
const aiPaintedTextures = ['/textures/studio/tvfront_filmikprojektdlamultiego_painted.webp', '/textures/studio/tvfront_filmikedytowaniezdjec_painted.webp'];
const iotTextures = ['/textures/studio/phonefront_followmeontiktok.webp'];
const iotPaintedTextures = ['/textures/studio/phonefront_followmeontiktok_painted.webp'];

let webIdx = 0, aiIdx = 0, iotIdx = 0;
let webPIdx = 0, aiPIdx = 0, iotPIdx = 0;

export const CONTENT_DATA = RAW_CONTENT_DATA.map((item) => {
    return {
        ...item,
        frontTexture: item.frontTexture || (
            item.platform === 'web' ? webTextures[webIdx++ % webTextures.length] :
                item.platform === 'ai_cyber' ? aiTextures[aiIdx++ % aiTextures.length] :
                    iotTextures[iotIdx++ % iotTextures.length]
        ),
        paintedFrontTexture: item.paintedFrontTexture || (
            item.platform === 'web' ? webPaintedTextures[webPIdx++ % webPaintedTextures.length] :
                item.platform === 'ai_cyber' ? aiPaintedTextures[aiPIdx++ % aiPaintedTextures.length] :
                    iotPaintedTextures[iotPIdx++ % iotPaintedTextures.length]
        )
    };
});

// Helper to get content by platform
export const getContentByPlatform = (platform) => {
    if (platform === 'all') return CONTENT_DATA;
    return CONTENT_DATA.filter(item => item.platform === platform);
};

// Get latest content (for "On Air" indicator)
export const getLatestContent = () => {
    return [...CONTENT_DATA].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
};
