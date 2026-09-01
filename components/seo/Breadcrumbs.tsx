"use client";

import Link from "next/link";


export type BreadcrumbItem = {
  label: string;
  href?: string;
};


export default function Breadcrumbs({
  items,
}: {
  items: BreadcrumbItem[];
}) {
  return (
    <>
      <nav
        className="aurosBreadcrumbs"
        aria-label="Breadcrumb"
      >
        {items.map(
          (
            item,
            index
          ) => (
            <div
              key={`${item.label}-${index}`}
              className="aurosBreadcrumbItem"
            >
              {index > 0 ? (
                <span
                  className="aurosBreadcrumbSeparator"
                  aria-hidden="true"
                >
                  /
                </span>
              ) : null}


              {item.href ? (
                <Link
                  href={item.href}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current="page"
                >
                  {item.label}
                </span>
              )}
            </div>
          )
        )}
      </nav>


      <style jsx global>{`
        .aurosBreadcrumbs {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 7px;

          margin: 0 0 18px;

          color: #69809f;

          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.03em;
        }


        .aurosBreadcrumbItem {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }


        .aurosBreadcrumbs a {
          color: #8299b8;
          text-decoration: none;

          transition:
            color
            140ms
            ease;
        }


        .aurosBreadcrumbs a:hover {
          color: #63ddff;
        }


        .aurosBreadcrumbItem
          > span[aria-current="page"] {
          color: #b4c3d8;
        }


        .aurosBreadcrumbSeparator {
          color: #405572;
        }


        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .aurosBreadcrumbs a {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}