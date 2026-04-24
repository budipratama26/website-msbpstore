import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize HTML string to prevent XSS attacks.
 * Use this for any dynamic HTML input/output.
 */
export function sanitizeHTML(html: string): string {
    if (!html) return "";
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            "b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li", "span", "div"
        ],
        ALLOWED_ATTR: ["href", "target", "rel", "class", "style"],
    });
}
