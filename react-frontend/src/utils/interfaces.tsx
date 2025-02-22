export type Language = 'fr' | 'en' | 'nl';

export interface Availability {
    id: number;
    name: string;
    city: string;
    unitCount: number;
    district: string;
    rentFrom: number;
    roomsCount: number;
    isComingSoon: boolean;
    picture: string;
    latitude: number;
    longitude: number;
    fullSlug: string;
}