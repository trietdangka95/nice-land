export function findActiveNavigationHref(
  pathname: string,
  hrefs: string[],
  baseHref: string,
) {
  return hrefs
    .filter((href) =>
      href === baseHref
        ? pathname === href
        : pathname === href || pathname.startsWith(`${href}/`),
    )
    .sort((left, right) => right.length - left.length)[0];
}
