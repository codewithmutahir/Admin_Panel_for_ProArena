"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Image as ImageIcon, Pencil, Loader2 } from "lucide-react";

// Firebase
import { db } from "@/lib/firebaseClient";
import { 
  collection, 
  doc, 
  updateDoc, 
  increment,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTx, setLoadingTx] = useState({ id: null, action: null });

  // FIXED: Use real-time listeners with proper sorting
  useEffect(() => {
    let unsubscribeTransactions;
    let unsubscribeUsers;

    const setupListeners = () => {
      try {
        // Listen to transactions with real-time updates, ordered by timestamp (newest first)
        const transactionsQuery = query(
          collection(db, "transactions"),
          orderBy("timestamp", "desc") // This ensures latest transactions appear first
        );
        
        unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
          const txData = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          setTransactions(txData);
          setLoading(false);
        }, (error) => {
          console.error("Error listening to transactions:", error);
          setLoading(false);
        });

        // Listen to users with real-time updates
        unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
          const userData = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          setUsers(userData);
        }, (error) => {
          console.error("Error listening to users:", error);
        });

      } catch (error) {
        console.error("Error setting up listeners:", error);
        setLoading(false);
      }
    };

    setupListeners();

    // Cleanup listeners on unmount
    return () => {
      if (unsubscribeTransactions) unsubscribeTransactions();
      if (unsubscribeUsers) unsubscribeUsers();
    };
  }, []);

  // Handle transaction status updates
  const updateTransactionStatus = async (transactionId, newStatus) => {
    try {
      setLoadingTx({ id: transactionId, action: newStatus });
      
      // Find the transaction
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) {
        console.error("Transaction not found");
        return;
      }

      // Update transaction status
      const transactionRef = doc(db, "transactions", transactionId);
      await updateDoc(transactionRef, { 
        status: newStatus,
        updatedAt: new Date() // Add timestamp for when status was updated
      });

      // Handle coins for approved transactions
      if (newStatus === "approved") {
        const userRef = doc(db, "users", transaction.userId);
        
        if (transaction.type === "deposit") {
          // Add coins for deposits
          await updateDoc(userRef, {
            coins: increment(transaction.amount)
          });
          console.log(`✅ Added ${transaction.amount} coins to user ${transaction.userId}`);
          
        } else if (transaction.type === "withdraw") {
          // Deduct coins for withdrawals
          await updateDoc(userRef, {
            coins: increment(-transaction.amount)
          });
          console.log(`✅ Deducted ${transaction.amount} coins from user ${transaction.userId}`);
        }
      }

      console.log(`Transaction ${transactionId} ${newStatus} successfully`);
      
    } catch (error) {
      console.error("Error updating transaction: ", error);
      alert(`Failed to ${newStatus} transaction: ${error.message}`);
    } finally {
      setLoadingTx({ id: null, action: null });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
        <CardDescription>
          Manage deposits and withdrawals • {transactions.length} total transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            No transactions found
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => {
              const user = users.find((u) => u.id === tx.userId);
              const isProcessing = loadingTx.id === tx.id;
              
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  {/* Info */}
                  <div className="space-y-1">
                    <p className="font-medium text-slate-900 flex items-center gap-2">
                      <DollarSign className={`h-4 w-4 ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`} />
                      {tx.type.toUpperCase()} - {tx.amount} Coins
                    </p>
                    <p className="text-sm text-slate-600">
                      Player: {user?.inGameName || "Unknown"} (UID: {user?.inGameUID || "Unknown"})
                    </p>
                    <p className="text-sm text-slate-600">
                      Current Coins: {user?.coins || 0}
                    </p>
                    
                    {/* Show account details for withdrawals */}
                    {tx.type === "withdraw" && (
                      <div className="text-sm text-slate-600 space-y-1">
                        {tx.accountNumber && (
                          <p>📱 Account: {tx.accountNumber}</p>
                        )}
                        {tx.accountType && (
                          <p>🏦 Type: {tx.accountType}</p>
                        )}
                        {tx.accountName && (
                          <p>👤 Name: {tx.accountName}</p>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>
                        Created: {tx.timestamp?.toDate
                          ? tx.timestamp.toDate().toLocaleString()
                          : "Unknown"}
                      </span>
                      {tx.updatedAt && (
                        <span>
                          Updated: {tx.updatedAt?.toDate
                            ? tx.updatedAt.toDate().toLocaleString()
                            : "Unknown"}
                        </span>
                      )}
                    </div>
                    
                    {tx.proof && (
                      <a
                        href={tx.proof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm flex items-center gap-1 hover:underline"
                      >
                        <ImageIcon className="h-4 w-4" /> View Proof
                      </a>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-3">
                      {tx.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={isProcessing}
                            onClick={() =>
                              updateTransactionStatus(tx.id, "approved")
                            }
                          >
                            {loadingTx.id === tx.id &&
                            loadingTx.action === "approved" ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Approving...
                              </>
                            ) : (
                              "✅ Approve"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={isProcessing}
                            onClick={() =>
                              updateTransactionStatus(tx.id, "rejected")
                            }
                          >
                            {loadingTx.id === tx.id &&
                            loadingTx.action === "rejected" ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Rejecting...
                              </>
                            ) : (
                              "❌ Reject"
                            )}
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isProcessing}
                          onClick={() =>
                            updateTransactionStatus(tx.id, "pending")
                          }
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Reset to Pending
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      className={
                        tx.status === "approved"
                          ? "bg-green-100 text-green-700 border-green-300"
                          : tx.status === "rejected"
                          ? "bg-red-100 text-red-700 border-red-300"
                          : "bg-yellow-100 text-yellow-700 border-yellow-300"
                      }
                    >
                      {tx.status.toUpperCase()}
                    </Badge>
                    {/* Transaction ID for reference */}
                    <span className="text-xs text-slate-400 font-mono">
                      {tx.id.slice(-6)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}