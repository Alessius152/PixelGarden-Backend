import { DecodedIdToken } from 'firebase-admin/auth'

type InternalUser = {
  id: number,
  userIdentification: {
    binUuidv7: Buffer,
    stringUuidv7: string,
    userId: string,
  }
  username: string,
}

declare module 'fastify' {
  interface FastifyRequest {
    firebaseProfile?: DecodedIdToken
    internalUser?: InternalUser
  }
}
