import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import TopNav from "./components/TopNav";
import CategoryList from "./pages/CategoryList";
import CategoryMenu from "./pages/CategoryMenu";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import { DistributorProvider } from "./store/distributor";
import { CartProvider } from "./store/cart";
import { useDistributor } from "./store/distributor";
import { SupplierProvider } from "./store/supplier";

const AppContent = () => {
  const distributor = useDistributor();

  return (
    <CartProvider distributorCode={distributor.code}>
      <div className="app">
        <TopNav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:supplierSuffix" element={<Home />} />
          <Route path="/d/:distributorCode" element={<Home />} />
          <Route path="/categories" element={<CategoryMenu />} />
          <Route path="/:supplierSuffix/categories" element={<CategoryMenu />} />
          <Route path="/category/:categoryName" element={<CategoryList />} />
          <Route path="/:supplierSuffix/category/:categoryName" element={<CategoryList />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/:supplierSuffix/product/:productId" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/:supplierSuffix/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/:supplierSuffix/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/:supplierSuffix/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/:supplierSuffix/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </CartProvider>
  );
};

const App = () => {
  return (
    <SupplierProvider>
      <DistributorProvider>
        <AppContent />
      </DistributorProvider>
    </SupplierProvider>
  );
};

export default App;
