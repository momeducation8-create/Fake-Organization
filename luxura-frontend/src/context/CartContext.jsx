import { createContext, useContext } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
// ↑ adjust this path to wherever useLocalStorage.js actually lives in your project

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
	const [cartItems, setCartItems] = useLocalStorage("luxura_cart", []);
	const loading = false; // kept for backward compatibility with any consumer expecting this key

	// Cart lives entirely in the browser until checkout. The only point this
	// app actually writes to MongoDB is when an Order is created via
	// POST /api/orders — see CartPage's handleCheckout.

	const addToCart = (product, qty = 1) => {
		setCartItems((prev) => {
			const existing = prev.find((item) => item._id === product._id);
			if (existing) {
				return prev.map((item) => (item._id === product._id ? { ...item, quantity: item.quantity + qty } : item));
			}
			return [...prev, { ...product, quantity: qty }];
		});
	};

	const updateQuantity = (productId, newQuantity) => {
		if (newQuantity < 1) {
			removeFromCart(productId);
			return;
		}
		setCartItems((prev) => prev.map((item) => (item._id === productId ? { ...item, quantity: newQuantity } : item)));
	};

	const removeFromCart = (productId) => {
		setCartItems((prev) => prev.filter((item) => item._id !== productId));
	};

	const clearCart = () => {
		setCartItems([]);
	};

	const cartSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
	const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

	return (
		<CartContext.Provider
			value={{
				cartItems,
				loading,
				addToCart,
				updateQuantity,
				removeFromCart,
				clearCart,
				cartSubtotal,
				cartCount,
			}}
		>
			{children}
		</CartContext.Provider>
	);
};

export const useCart = () => useContext(CartContext);