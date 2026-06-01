import multer from 'multer'
import os from 'os'
import path from 'path'
import * as crypto from 'node:crypto'
import { put } from '@vercel/blob'

// Build the same `${date}_${hash}${ext}` filename the routes used with diskStorage,
// so URLs stored in the database keep their existing shape.
function genFilename(originalname: string, forceExt?: string): string {
    const hashKey = crypto.randomBytes(8).toString('hex')
    const date = new Date().toISOString().split('T')[0]
    const extension = forceExt ?? path.extname(originalname)
    return `${date}_${hashKey}${extension}`
}

/**
 * Storage for files that must persist (images, attachments, documents).
 * Uploads to Vercel Blob at `uploads/<folder>/<filename>` and exposes the same
 * `file.filename` / `file.path` fields the old diskStorage produced, so existing
 * controllers keep building `/uploads/<folder>/<filename>` URLs without changes.
 * Those URLs are served back by the redirect in routers/index.ts.
 */
export function blobStorage(folder: string): multer.StorageEngine {
    return {
        _handleFile(_req, file, cb) {
            const chunks: Buffer[] = []
            file.stream.on('data', (c: Buffer) => chunks.push(c))
            file.stream.on('error', cb)
            file.stream.on('end', () => {
                const buffer = Buffer.concat(chunks)
                const filename = genFilename(file.originalname)
                const pathname = `uploads/${folder}/${filename}`
                put(pathname, buffer, {
                    access: 'public',
                    addRandomSuffix: false,
                    contentType: file.mimetype,
                    token: process.env.BLOB_READ_WRITE_TOKEN,
                })
                    .then(() => cb(null, { filename, path: pathname, size: buffer.length } as any))
                    .catch((err: unknown) => cb(err as Error))
            })
        },
        _removeFile(_req, _file, cb) {
            cb(null)
        },
    }
}

/**
 * Storage for transient files (CSV parsed then deleted within the same request).
 * Writes to the OS temp dir, which is writable on Vercel serverless, and keeps
 * `file.path` working for readCSVFile().
 */
export function tmpStorage(ext?: string): multer.StorageEngine {
    return multer.diskStorage({
        destination: os.tmpdir(),
        filename: (_req, file, cb) => cb(null, genFilename(file.originalname, ext)),
    })
}
