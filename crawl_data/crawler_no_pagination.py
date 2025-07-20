import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import json
import os
from bs4 import Tag, NavigableString
from tqdm import tqdm


def get_links(url, prefix="https://youmed.vn/tin-tuc/"):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, "html.parser")
    links = set()

    main_tag = soup.find("main")
    if not main_tag:
        return links  # Không có thẻ <main>

    for a_tag in main_tag.find_all("a", href=True):
        if a_tag.find_parent(class_="primary-desktop-menu"):
            continue
        href = a_tag["href"]
        if href.startswith("/"):
            href = "https://youmed.vn" + href
        if href.startswith(prefix):
            links.add(href)

    return links


def extract_article_content(article_soup):
    """
    Lấy nội dung bài viết từ trang web
    """
    # Lấy thẻ <article> đầu tiên
    article = article_soup.find("article")
    if not article:
        return None
    groupts = []
    nav_div = article_soup.find(class_="text-sm text-gray-600")
    if nav_div and "Trang chủ" in nav_div.get_text():
        groupts = [a.get_text(strip=True) for a in nav_div.find_all("a")]

    def parse_element(el):
        if isinstance(el, Tag):
            tag = el.name
            children = []
            for child in el.children:
                parsed = parse_element(child)
                if parsed is not None and (
                    isinstance(parsed, dict)
                    or (isinstance(parsed, str) and parsed.strip())
                ):
                    children.append(parsed)
            if children:
                return {tag: children}
            else:
                if tag == "img":
                    text = el.get("src")
                else:
                    text = el.get_text(strip=True)
                return {tag: text} if text else None
        elif isinstance(el, NavigableString):
            text = str(el).strip()
            return text if text else None
        else:
            return None

    return (parse_element(article), groupts)


def crawl_and_save_articles(list_links, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    for link in tqdm(list_links):
        try:
            resp = requests.get(link)
            soup = BeautifulSoup(resp.content, "html.parser")
            result = extract_article_content(soup)
            if result is not None:
                content, groupts = result
                if content and isinstance(content, dict) and "article" in content:
                    content = content["article"][:-1]
                else:
                    content = None
            else:
                content = None
                groupts = []
            if content:
                # Add groupts to the content dict
                if isinstance(content, list):
                    content = {"content": content, "groupts": groupts}
                # Tạo tên file từ slug cuối của link
                slug = link.rstrip("/").split("/")[-1]
                out_path = os.path.join(output_dir, f"{slug}.json")
                with open(out_path, "w", encoding="utf-8") as f:
                    json.dump(content, f, ensure_ascii=False, indent=2)
            else:
                print(f"Không tìm thấy nội dung article cho: {link}")
        except Exception as e:
            print(f"Lỗi với link {link}: {e}")


if __name__ == "__main__":
    data_link = [
        {
            "url": "https://youmed.vn/tin-tuc/trieu-chung-benh/",
            "output_dir": "./data/Tra cứu bệnh/",
        },
        {
            "url": "https://youmed.vn/tin-tuc/duoc/",
            "output_dir": "./data/Tra cứu Thuốc & Dược liệu/Thuốc/",
        },
        {
            "url": "https://youmed.vn/tin-tuc/y-hoc-co-truyen/duoc-lieu/",
            "output_dir": "./data/Tra cứu Thuốc & Dược liệu/Dược liệu/",
        },  #
        {
            "url": "https://youmed.vn/tin-tuc/hieu-ve-co-the-ban/",
            "output_dir": "./data/Tra cứu Thuốc & Dược liệu/Hiểu Về Cơ Thể Bạn/",
        },
    ]
    for data in data_link:

        benh_links = get_links(data["url"])
        os.makedirs(data["output_dir"], exist_ok=True)
        crawl_and_save_articles(benh_links, data["output_dir"])
