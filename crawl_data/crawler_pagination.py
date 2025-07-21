import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import json
import os
from bs4 import Tag, NavigableString
from tqdm import tqdm
import concurrent.futures
import random


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


def get_fake_headers():
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:115.0) Gecko/20100101 Firefox/115.0",
    ]
    return {
        "User-Agent": random.choice(user_agents),
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Connection": "keep-alive",
    }


def crawl_single_article(link_output):
    link, output_dir = link_output
    try:
        resp = requests.get(link, headers=get_fake_headers(), timeout=10)
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
            if isinstance(content, list):
                content = {"content": content, "groupts": groupts}
            slug = link.rstrip("/").split("/")[-1]
            out_path = os.path.join(output_dir, f"{slug}.json")
            # with open(out_path, "w", encoding="utf-8") as f:
            #     json.dump(content, f, ensure_ascii=False, indent=2)
        else:
            print(f"Không tìm thấy nội dung article cho: {link}")
    except Exception as e:
        print(f"Lỗi với link {link}: {e}")


def crawl_and_save_articles(list_links, output_dir, max_workers=8):
    os.makedirs(output_dir, exist_ok=True)
    link_outputs = [(link, output_dir) for link in list_links]
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        list(
            tqdm(
                executor.map(crawl_single_article, link_outputs),
                total=len(link_outputs),
            )
        )


def get_max_page(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, "html.parser")
    max_page = 1
    pagination = soup.find("div", class_="pagination")
    if pagination:
        last_page_link = pagination.find_all("a")
        for a_tag in last_page_link:
            if a_tag.get_text(strip=True).isdigit():
                try:
                    max_page = max(int(a_tag.get_text(strip=True)), max_page)
                except ValueError:
                    continue

    return max_page


def get_link_to_file(html_path: str = "html.html"):
    """
    Lấy các liên kết từ một tệp HTML có cấu trúc menu dropdown.

    Args:
        html_path (str): Đường dẫn tới tệp HTML.

    Returns:
        set: Tập hợp các liên kết (href) tìm được.
    """
    links = []

    # Đọc nội dung tệp HTML
    with open(html_path, "r", encoding="utf-8") as file:
        html_content = file.read()

    soup = BeautifulSoup(html_content, "html.parser")

    # Tìm tất cả thẻ li có class là menu-item
    menu_items = soup.find_all("li", class_="menu-item")

    for item in menu_items:
        # Tìm thẻ <a> trong mỗi menu-item
        link = item.find("a")
        if link and link.has_attr("href"):
            href = link["href"]
            title = link.get_text(strip=True)
            links.append({"title": title, "href": href})

    return links


if __name__ == "__main__":
    ###### Mang thai & Nuôi dạy con
    # url = "https://youmed.vn/tin-tuc/nuoi-day-con/"
    # max_page = get_max_page(url)
    # os.makedirs("./data/Mang thai & Nuôi dạy con/", exist_ok=True)
    # data_link = [
    #     {
    #         "url": f"https://youmed.vn/tin-tuc/nuoi-day-con/page/{d}/",
    #         "output_dir": "./data/Mang thai & Nuôi dạy con/",
    #     }
    #     for d in range(1, max_page + 1)
    # ]
    # for data in data_link:

    #     benh_links = get_links(data["url"])
    #     crawl_and_save_articles(benh_links, data["output_dir"])
    #####
    link_origin = get_link_to_file("html.html")
    for link in link_origin:
        url = link["href"]
        print("crawling: ", url)
        max_page = get_max_page(url)
        os.makedirs(f"./data/Chủ đề được quan tâm nhiều/{link['title']}", exist_ok=True)
        data_link = [
            {
                "url": f"{url}page/{d}/",
                "output_dir": f"./data/Chủ đề được quan tâm nhiều/{link['title']}/",
            }
            for d in range(1, max_page + 1)
        ]

        for data in data_link:
            print("crawling: ", data["url"])
            benh_links = get_links(data["url"])
            crawl_and_save_articles(benh_links, data["output_dir"])
