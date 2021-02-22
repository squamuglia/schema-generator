# 🏭 GQL Schema Generator

Being able to generate a local schema SDL file from your GQL api allows you to more easily generate types for use in your application, you can even use a package [like this](https://graphql-code-generator.com/).

It can also be helpful to generate a schema from a local schema json file, so this app now supports this too.

If you're like me and you like to validate data as it comes into your application, you also can use those types alongeside packages like [Decoders](https://www.npmjs.com/package/decoders)

### Getting Started

```
yarn global add gql-schema-generator

npm install -g gql-schema-generator

```

and run:

```
generate-schema -u [url of graphql endpoint] -o [output file name].gql

generate-schema-from-file -i [path to json file.json] -o [output file name].gql
```
