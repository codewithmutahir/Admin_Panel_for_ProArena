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
import { 
  DollarSign, 
  Image as ImageIcon, 
  Pencil, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X
} from "lucide-react";

// Firebase
import { db } from "@/lib/firebaseClient";
import { 
  collection, 
  doc, 
  updateDoc, 
  increment,
  onSnapshot,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getCountFromServer
} from "firebase/firestore";

// Image Preview Modal Component
const ImagePreviewModal = ({ imageUrl, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Proof Image</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-4 overflow-auto max-h-[80vh] flex justify-center">
          <img 
            src={imageUrl} 
            alt="Transaction proof" 
            className="max-w-full max-h-full object-contain"
          />
        </div>
        <div className="p-4 border-t flex justify-end">
          <Button asChild>
            <a href={imageUrl} target="_blank" rel="noopener noreferrer">
              Open Original in New Tab
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTx, setLoadingTx] = useState({ id: null, action: null });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [lastVisible, setLastVisible] = useState(null);
  const [firstVisible, setFirstVisible] = useState(null);
  const [pageHistory, setPageHistory] = useState([]);

  // Image preview state
  const [previewImage, setPreviewImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Handle image preview
  const openImagePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeImagePreview = () => {
    setIsModalOpen(false);
    setPreviewImage(null);
  };

  // FIXED: Use real-time listeners with proper sorting and pagination
  useEffect(() => {
    let unsubscribeTransactions;
    let unsubscribeUsers;

    const setupListeners = () => {
      try {
        // Get total count of transactions
        const getTotalCount = async () => {
          const coll = collection(db, "transactions");
          const snapshot = await getCountFromServer(coll);
          setTotalItems(snapshot.data().count);
        };
        
        getTotalCount();

        // Listen to transactions with real-time updates, ordered by timestamp (newest first)
        const transactionsQuery = query(
          collection(db, "transactions"),
          orderBy("timestamp", "desc"),
          limit(itemsPerPage)
        );
        
        unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
          const txData = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          
          // Set pagination markers
          if (snapshot.docs.length > 0) {
            setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
            setFirstVisible(snapshot.docs[0]);
          }
          
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
  }, [itemsPerPage]);

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

  // Handle pagination navigation
  const handleNextPage = async () => {
    if (!lastVisible) return;
    
    setLoading(true);
    try {
      const nextQuery = query(
        collection(db, "transactions"),
        orderBy("timestamp", "desc"),
        startAfter(lastVisible),
        limit(itemsPerPage)
      );
      
      const documentSnapshots = await getDocs(nextQuery);
      
      // Update page history
      setPageHistory(prev => [...prev, {
        firstVisible,
        lastVisible,
        page: currentPage
      }]);
      
      // Get the last visible item
      if (documentSnapshots.docs.length > 0) {
        setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
        setFirstVisible(documentSnapshots.docs[0]);
      }
      
      const txData = documentSnapshots.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      
      setTransactions(txData);
      setCurrentPage(prev => prev + 1);
    } catch (error) {
      console.error("Error fetching next page:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPage = async () => {
    if (pageHistory.length === 0) return;
    
    setLoading(true);
    try {
      // Get the previous page state from history
      const prevState = pageHistory[pageHistory.length - 1];
      
      // Recreate the query for the previous page
      const prevQuery = query(
        collection(db, "transactions"),
        orderBy("timestamp", "desc"),
        startAfter(prevState.firstVisible),
        limit(itemsPerPage)
      );
      
      const documentSnapshots = await getDocs(prevQuery);
      
      // Update state with previous page data
      if (documentSnapshots.docs.length > 0) {
        setLastVisible(prevState.lastVisible);
        setFirstVisible(prevState.firstVisible);
      }
      
      const txData = documentSnapshots.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      
      setTransactions(txData);
      setCurrentPage(prevState.page);
      
      // Remove the last item from history
      setPageHistory(prev => prev.slice(0, -1));
    } catch (error) {
      console.error("Error fetching previous page:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFirstPage = async () => {
    setLoading(true);
    try {
      const firstQuery = query(
        collection(db, "transactions"),
        orderBy("timestamp", "desc"),
        limit(itemsPerPage)
      );
      
      const documentSnapshots = await getDocs(firstQuery);
      
      // Get the first and last visible items
      if (documentSnapshots.docs.length > 0) {
        setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
        setFirstVisible(documentSnapshots.docs[0]);
      }
      
      const txData = documentSnapshots.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      
      setTransactions(txData);
      setCurrentPage(1);
      setPageHistory([]);
    } catch (error) {
      console.error("Error fetching first page:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLastPage = async () => {
    setLoading(true);
    try {
      // For last page, we need to calculate how many items to skip
      // This is a simplified approach - in a real app you might need a different strategy
      const estimatedLastPageStart = (totalPages - 1) * itemsPerPage;
      
      // Get a query to find the starting point for the last page
      const lastPageQuery = query(
        collection(db, "transactions"),
        orderBy("timestamp", "desc"),
        limit(estimatedLastPageStart)
      );
      
      const skipDocs = await getDocs(lastPageQuery);
      
      if (skipDocs.docs.length > 0) {
        const lastDoc = skipDocs.docs[skipDocs.docs.length - 1];
        
        // Now get the actual last page
        const finalQuery = query(
          collection(db, "transactions"),
          orderBy("timestamp", "desc"),
          startAfter(lastDoc),
          limit(itemsPerPage)
        );
        
        const documentSnapshots = await getDocs(finalQuery);
        
        if (documentSnapshots.docs.length > 0) {
          setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
          setFirstVisible(documentSnapshots.docs[0]);
        }
        
        const txData = documentSnapshots.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        
        setTransactions(txData);
        setCurrentPage(totalPages);
        setPageHistory([]);
      }
    } catch (error) {
      console.error("Error fetching last page:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            Manage deposits and withdrawals • {totalItems} total transactions
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
            <>
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
                      <div className="space-y-1 flex-1">
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
                          <div className="mt-2">
                            <button
                              onClick={() => openImagePreview(tx.proof)}
                              className="text-blue-600 text-sm flex items-center gap-1 hover:underline"
                            >
                              <ImageIcon className="h-4 w-4" /> View Proof
                            </button>
                          </div>
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
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-slate-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFirstPage}
                      disabled={currentPage === 1 || loading}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages || loading}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLastPage}
                      disabled={currentPage === totalPages || loading}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-slate-600">
                    Showing {transactions.length} of {totalItems} transactions
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Image Preview Modal */}
      <ImagePreviewModal 
        imageUrl={previewImage} 
        isOpen={isModalOpen} 
        onClose={closeImagePreview} 
      />
    </>
  );
}