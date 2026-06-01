import { RefreshTokens, Customer, Tenant, RefreshTokensAdmin, Admin } from '@prisma/client'
import { db } from '../../utils/db.server'
import { hashToken } from '../../utils/hashToken'

// used when we create a refresh token.
export function addRefreshTokenToWhitelist({
  jti,
  refreshToken,
  CustomerId,
  TenantId
}: {
  jti: string
  refreshToken: string
  CustomerId: Customer['CustomerId']
  TenantId: Tenant['TenantId']
}) {
  return db.refreshTokens.create({
    data: {
      RefreshTokenId: jti,
      HashedToken: hashToken(refreshToken),
      CustomerId,
      TenantId
    },
  })
}
export function addRefreshTokenToWhitelistAdmin({
  jti,
  refreshToken,
  AdminId,
  TenantId
}: {
  jti: string
  refreshToken: string
  AdminId: Admin['AdminId']
  TenantId: Tenant['TenantId']
}) {
  return db.refreshTokensAdmin.create({
    data: {
      RefreshTokenId: jti,
      HashedToken: hashToken(refreshToken),
      AdminId,
      TenantId
    },
  })
}

// used to check if the token sent by the client is in the database.
export function findRefreshTokenById(RefreshTokenId: RefreshTokens['RefreshTokenId']) {
  return db.refreshTokens.findUnique({
    where: {
        RefreshTokenId,
    },
  })
}
export function findRefreshTokenByIdAdmin(RefreshTokenId: RefreshTokensAdmin['RefreshTokenId']) {
  return db.refreshTokensAdmin.findUnique({
    where: {
        RefreshTokenId,
    },
  })
}

// soft delete tokens after usage.
export function deleteRefreshToken(RefreshTokenId: RefreshTokens['RefreshTokenId']) {
  return db.refreshTokens.update({
    where: {
      RefreshTokenId,
    },
    data: {
      Revoked: true,
    },
  })
}
export function deleteRefreshTokenAdmin(RefreshTokenId: RefreshTokensAdmin['RefreshTokenId']) {
  return db.refreshTokensAdmin.update({
    where: {
      RefreshTokenId,
    },
    data: {
      Revoked: true,
    },
  })
}

export async function revokeTokens(CustomerId: Customer['CustomerId']) {
  const tokensToUpdate = await db.refreshTokens.findMany({
    where: {
      CustomerId,
      Revoked: false,
    },
    orderBy: {
      CreatedTime: 'desc',
    },
    select: {
      RefreshTokenId: true,
    },
  });

  const tokenIds = tokensToUpdate.map(token => token.RefreshTokenId);
  if (tokenIds.length > 0) {
    return db.refreshTokens.updateMany({
      where: {
        RefreshTokenId: {
          in: tokenIds,
        },
      },
      data: {
        Revoked: true,
      },
    });
  }
  return;
}
export async function revokeTokensAdmin(AdminId: Admin['AdminId']) {
  const tokensToUpdate = await db.refreshTokensAdmin.findMany({
    where: {
      AdminId,
      Revoked: false,
    },
    orderBy: {
      CreatedTime: 'desc',
    },
    select: {
      RefreshTokenId: true,
    },
  });

  const tokenIds = tokensToUpdate.map(token => token.RefreshTokenId);
  if (tokenIds.length > 0) {
    return db.refreshTokensAdmin.updateMany({
      where: {
        RefreshTokenId: {
          in: tokenIds,
        },
      },
      data: {
        Revoked: true,
      },
    });
  }
  return;
}