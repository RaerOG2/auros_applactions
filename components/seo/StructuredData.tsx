type StructuredDataProps = {
  data:
    unknown;
};


function serializeStructuredData(
  data:
    unknown
) {
  return JSON.stringify(
    data
  ).replace(
    /</g,
    "\\u003c"
  );
}


export default function StructuredData({
  data,
}: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html:
          serializeStructuredData(
            data
          ),
      }}
    />
  );
}