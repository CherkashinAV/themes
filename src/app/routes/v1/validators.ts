import z, {ZodError} from 'zod';

export function formatZodError(error: ZodError): string {
    return error.issues
        .map((issue) => {
            return `${issue.path.join('/')}:${issue.message}`;
        })
        .join(' ');
}
