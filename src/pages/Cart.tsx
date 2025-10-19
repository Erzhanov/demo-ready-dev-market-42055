import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ShoppingBag, Trash2 } from "lucide-react";

const Cart = () => {
  const { items, removeFromCart, totalPrice, itemCount } = useCart();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {t.cart.title}
        </h1>

        {itemCount === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-xl text-muted-foreground mb-6">{t.cart.empty}</p>
            <Link to="/">
              <Button className="rounded-full">{t.cart.continueShopping}</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="glass-card border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-gradient-glass flex items-center justify-center text-3xl font-bold text-white">
                          {item.title.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <p className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                          ${item.price}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="glass-card border-white/20 sticky top-4">
                <CardHeader>
                  <CardTitle>{t.cart.total}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    ${totalPrice.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </p>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button className="w-full rounded-full bg-gradient-glass">
                    {t.cart.checkout}
                  </Button>
                  <Link to="/" className="w-full">
                    <Button variant="outline" className="w-full rounded-full">
                      {t.cart.continueShopping}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
