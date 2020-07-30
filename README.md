# 🏭 GQL Schema Generator

Being able to generate a local schema SDL file from your GQL api allows you to more easily generate types for use in your application, you can even use a package [like this](https://graphql-code-generator.com/).

If you're like me and you like to validate data as it comes into your application, you also can use those types alongeside packages like [Decoders](https://www.npmjs.com/package/decoders)

### Getting Started

```
yarn add gql-schema-generator

npm install gql-schema-generator

```

and run:

```
generate-schema -r [name of your repository] -o [output file name].gql
```
