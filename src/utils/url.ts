/**
 * Prepend Astro's configured base path to an internal URL.
 *
 * Usage:
 *   import { url } from '@/utils/url'
 *   <a href={url('/blog')}>Blog</a>
 *   <link rel="icon" href={url('/favicon.svg')} />
 *
 * Works regardless of whether BASE_URL has a trailing slash or not.
 */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}/${path.replace(/^\//, '')}`
}
