const categories = [
  "全部类别",
  "其他类别",
  "套餐",
  "手持烟花",
  "地面喷花",
  "纸炮",
  "升空类",
  "夜景烟花",
  "日景烟花",
  "摔炮"
];

const hotProducts = [
  {
    id: 1,
    name: "夜景礼花套装",
    price: "¥298",
    image:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=400&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "手持仙女棒",
    price: "¥29",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=400&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "星空喷泉",
    price: "¥69",
    image:
      "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=400&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "开业礼炮",
    price: "¥128",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=400&auto=format&fit=crop"
  }
];

const Home = () => {
  return (
    <main className="page home">
      <section className="hero">
        <div className="search">
          <span>🔍</span>
          <input placeholder="商品名称 / 条码" />
        </div>
        <div className="banner">
          <div>
            <h2>热销爆品</h2>
            <p>优惠多多</p>
          </div>
          <button type="button">立即选购</button>
        </div>
        <div className="dots">
          <span className="dot active" />
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </section>

      <section className="notice">
        <span>公告</span>
        <p>「有商品满200 都有赠送小礼物 欢迎新老顾客前来订货」</p>
      </section>

      <section className="categories">
        {categories.map((item) => (
          <div key={item} className="category-item">
            <div className="icon">商</div>
            <span>{item}</span>
          </div>
        ))}
      </section>

      <section className="hot-list">
        <header>
          <h3>热销排行榜</h3>
          <span>查看全部</span>
        </header>
        <div className="product-grid">
          {hotProducts.map((product) => (
            <article key={product.id} className="product-card">
              <img src={product.image} alt={product.name} />
              <div>
                <h4>{product.name}</h4>
                <p>{product.price}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;
