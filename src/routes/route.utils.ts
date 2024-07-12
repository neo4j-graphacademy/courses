import { BASE_URL, CDN_URL } from "../constants";

export function courseOgBannerImage(slug: string): string {
    return CDN_URL ? `${CDN_URL}/img/courses/banners/${slug}.png` : `${BASE_URL}/courses/${slug}/banner/`
}

export function courseOgBadgeImage(slug: string): string {
    return CDN_URL ? `${CDN_URL}/img/courses/badges/${slug}.svg` : `${BASE_URL}/courses/${slug}/badge/`
}

export function certificationOgBannerImage(slug: string): string {
    return CDN_URL ? `${CDN_URL}/img/certifications/banners/${slug}.png` : `${BASE_URL}/certifications/${slug}/banner/`
}

export function certificationOgBadgeImage(slug: string): string {
    return CDN_URL ? `${CDN_URL}/img/certifications/badges/${slug}.svg` : `${BASE_URL}/certifications/${slug}/badge/`
}
