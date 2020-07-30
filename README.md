# 🏭 Prismic Schema Generator

Being able to generate a schema SDL file from prismic allows you to build custom types in Prismic and then generate types for use in your application, you can even use a package [like this](https://graphql-code-generator.com/).

If you're like me and you like to validate data as it comes into your application, you also can use those types alongeside packages like [Decoders](https://www.npmjs.com/package/decoders)

### Getting Started

```
yarn add prismic-schema-generator

npm install prismic-schema-generator

```

and run:

```
prismic-schema -r [name of your repository] -o [output file name].gql
```

#### Notes

Prismic has an annoying habit of typing large sections of responses as JSON, particularly rich text and images. Here are two types you can use for those instances:

```
interface PrismicRichText Array<{
  type: string | null,
  text: string | null,
  spans: Array<{|
    start: number | null,
    end: number | null,
    type: string | null,
    data: mixed | null,
  } | null>,
} | null>;
```

```
interface PrismicImage {
  url: string | null,
  alt: string | null,
  copyright: string | null,
  dimensions: {
    width: number | null,
    height: number | null,
  },
} | null;
```
