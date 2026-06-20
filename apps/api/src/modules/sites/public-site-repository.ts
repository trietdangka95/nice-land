export interface PublicSiteConfig {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  logo: string | null;
  banner: string | null;
  themeColor: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  facebookUrl: string | null;
  zaloPhone: string | null;
}

export interface PublicSiteRepository {
  findPublicConfig(siteId: string): Promise<PublicSiteConfig | null>;
}
