// eslint-disable-next-line @typescript-eslint/no-var-requires
const transformer = require('@nestjs/graphql/plugin')

module.exports.name = 'nestjs-graphql-transformer'
// you should change the version number anytime you change the configuration below - otherwise, jest will not detect changes
module.exports.version = 1

module.exports.factory = (cs) => {
  return transformer.before(
    {
      // @nestjs/graphql/plugin options (can be empty)
      introspectComments: true,
      typeFileNameSuffix: [
        '.args.ts',
        '.dto.ts',
        '.entity.ts',
        '.input.ts',
        '.model.ts',
      ],
    },
    cs.tsCompiler.program,
  )
}
