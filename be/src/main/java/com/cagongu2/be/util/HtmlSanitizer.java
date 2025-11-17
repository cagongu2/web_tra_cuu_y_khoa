package com.cagongu2.be.util;

import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.springframework.stereotype.Component;

@Component
public class HtmlSanitizer {

    private static final PolicyFactory POLICY = new HtmlPolicyBuilder()
            // Allow common text formatting
            .allowElements("p", "br", "strong", "b", "em", "i", "u", "strike", "sub", "sup")
            // Allow headings
            .allowElements("h1", "h2", "h3", "h4", "h5", "h6")
            // Allow lists
            .allowElements("ul", "ol", "li")
            // Allow links with limited attributes
            .allowElements("a")
            .allowAttributes("href").onElements("a")
            .allowAttributes("target").matching(true, "_blank").onElements("a")
            // Allow images with limited attributes
            .allowElements("img")
            .allowAttributes("src", "alt", "title", "width", "height").onElements("img")
            // Allow tables
            .allowElements("table", "thead", "tbody", "tr", "th", "td")
            // Allow blockquotes and code
            .allowElements("blockquote", "code", "pre")
            // Allow div and span with limited attributes
            .allowElements("div", "span")
            .allowAttributes("class").onElements("div", "span", "p", "code", "pre")
            .toFactory();

    /**
     * Sanitize HTML content to prevent XSS attacks
     */
    public String sanitize(String html) {
        if (html == null || html.isBlank()) {
            return html;
        }
        return POLICY.sanitize(html);
    }
}