# **Autocomplete API Scraper - Extract All Names** 🚀  

## **📌 Problem Statement**  
We have access to an **autocomplete API** at:  
👉 `http://35.200.185.69:8000`  

### **Goal:**  
Extract **all possible names** from the API efficiently.  

### **Challenges:**  
1. **No Documentation** – We must explore how the API works.  
2. **Rate Limiting** – Too many requests cause API blocks.  
3. **Efficiency** – Need to minimize duplicate requests and optimize speed.  

---

## **🔍 API Exploration & Findings**  

### **1⃣ API Endpoint**  
We discovered the API works with:  
```
http://35.200.185.69:8000/v1/autocomplete?query=<string>
```  
📌 **How it works:**  
- `/v1/autocomplete?query=a` → Returns names starting with "a"  
- `/v1/autocomplete?query=ab` → Returns names starting with "ab"  

### **2⃣ Rate Limiting & Errors**  
If we send too many requests too fast, we get:  
❌ **429 Too Many Requests** – API blocks us temporarily.  

### **3⃣ Best Strategy to Extract All Names**  
✅ Start with letters **"a" to "z"**  
✅ Query the API, get names, and explore further (e.g., `"aa", "ab", "ac"`)  
✅ Handle rate limits using **adaptive delays and retries**  

---

## **💡 Our Approach**  

### **1⃣ Intelligent Query Expansion**  
- Start with **two-character queries** like `"aa", "ab", "ac"`  
- If results are **maxed out**, expand to `"aaa", "aab", "aac"`  

### **2⃣ Smart Rate Limiting**  
- We **track API speed** and adjust delays dynamically  
- Implement **automatic retries** for rate-limited queries  

### **3⃣ Optimized Storage**  
- Save fetched names in a **set** to avoid duplicates  
- Write results to a file (`output/names_v1.txt`, etc.)  

---

## **⚙️ How to Run the Scraper**  

### **Step 1: Install Dependencies**  
```sh
npm install
```  

### **Step 2: Run the Scraper**  
```sh
node index.js v1
```  
Replace `v1` with `v2` or `v3` for different API versions.  

### **Step 3: View Extracted Names**  
Check the `output/` folder for extracted names.  

---

## **📊 Results & Findings**  

Since we only expanded queries when needed, the actual number of searches is much lower.

| API Version       | Brute Force Searches | Optimized Estimated Searches |
|-------------------|----------------------|------------------------------|
| v1 (A-Z)          | 17576 (26*26*26)     | ~4000 - 6000                 |
| v2 (0-9, A-Z)     | 46656 (36*36*36)     | ~8000 - 12000                |
| v3 (Full charset) | 64000 (40*40*40)     | ~12000 - 16000               |

| API Version | Total Requests | Unique Names Extracted |
|------------|--------------   |------------------------|
| v1         |      13048      |         13676          |
| v2         |      ~10000     |         7873           |
| v3         |      9015     |         8533           |

✅ **Key Discoveries:**  
- API supports **different character sets** per version.  
- **Rate limits vary** (v1 is faster, v3 is more restricted).  
- Expanding queries **improves data coverage**.  

---

## **💁️‍💻 Project Structure**  
```
📂 autocomplete-extractor
 ├── 📂 output/                # Extracted names storage
 ├── 📂 src/                   # Main code
 │   ├── api.js                # API requests & rate limiting
 │   ├── scraper.js            # Name extraction logic
 │   ├── rateLimiter.js        # Adaptive rate limit handling
 │   ├── utils.js              # Helper functions
 ├── index.js                  # Main entry point
 ├── package.json              # Dependencies
 ├── README.md                 # Documentation
```

---

## **📢 Summary**  
✅ **We successfully extracted all possible names** from the API.  
✅ **Rate limiting was handled** with dynamic delays & retries.  
✅ **Optimized query expansion** improved data coverage.  

💡 **Future Improvements:**  
- Parallel requests with **better rate limit tracking**  
- Store extracted data in **a database instead of files**  

