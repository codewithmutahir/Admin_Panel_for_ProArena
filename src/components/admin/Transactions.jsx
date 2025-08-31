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
  FileImage, 
  Pencil, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  User,
  CreditCard,
  Building,
  Clock,
  Hash
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Transaction Proof</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6 overflow-auto max-h-[calc(90vh-140px)] flex justify-center bg-slate-50 dark:bg-slate-800">
          <img 
            src={imageUrl} 
            alt="Transaction proof" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
          />
        </div>
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end bg-slate-50 dark:bg-slate-800">
          <Button asChild className="rounded-full">
            <a href={imageUrl} target="_blank" rel="noopener noreferrer">
              Open Original
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
      <div className="space-y-6">
        {/* Header Card */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
          <CardHeader className="pb-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Transaction Management
                </CardTitle>
                <CardDescription className="text-lg mt-2 text-slate-600 dark:text-slate-300">
                  Monitor and manage all deposit and withdrawal requests
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalItems}</div>
                <div className="text-sm text-slate-500">Total Transactions</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Transactions List */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="p-6 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-4 w-32" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No transactions found</h3>
                <p className="text-slate-500">All transaction requests will appear here</p>
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
                        className="group p-6 border border-slate-200 rounded-2xl hover:shadow-lg hover:border-slate-300 transition-all duration-200 bg-white hover:bg-slate-50"
                      >
                        {/* Header Row */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-full ${
                              tx.type === 'deposit' 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-red-100 text-red-600'
                            }`}>
                              <DollarSign className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900">
                                {tx.type.toUpperCase()} • {tx.amount} Coins
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  className={`rounded-full text-xs font-medium ${
                                    tx.status === "approved"
                                      ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100"
                                      : tx.status === "rejected"
                                      ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-100"
                                      : "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100"
                                  }`}
                                >
                                  {tx.status.toUpperCase()}
                                </Badge>
                                <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded-full">
                                  #{tx.id.slice(-6)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* User Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                              <User className="h-4 w-4 text-slate-400" />
                              <div>
                                <span className="text-slate-500">Player:</span>
                                <span className="ml-2 font-medium text-slate-900">
                                  {user?.inGameName || "Unknown"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <Hash className="h-4 w-4 text-slate-400" />
                              <div>
                                <span className="text-slate-500">UID:</span>
                                <span className="ml-2 font-mono text-slate-700">
                                  {user?.inGameUID || "Unknown"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <DollarSign className="h-4 w-4 text-slate-400" />
                              <div>
                                <span className="text-slate-500">Account Balance:</span>
                                <span className="ml-2 font-bold text-green-600">
                                  {user?.coins || 0} Coins
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Account Details for Withdrawals */}
                          {tx.type === "withdraw" && (
                            <div className="space-y-3">
                              {tx.accountNumber && (
                                <div className="flex items-center gap-3 text-sm">
                                  <CreditCard className="h-4 w-4 text-slate-400" />
                                  <div>
                                    <span className="text-slate-500">Account:</span>
                                    <span className="ml-2 font-mono text-slate-700">
                                      {tx.accountNumber}
                                    </span>
                                  </div>
                                </div>
                              )}
                              {tx.accountType && (
                                <div className="flex items-center gap-3 text-sm">
                                  <Building className="h-4 w-4 text-slate-400" />
                                  <div>
                                    <span className="text-slate-500">Type:</span>
                                    <span className="ml-2 font-medium text-slate-700">
                                      {tx.accountType}
                                    </span>
                                  </div>
                                </div>
                              )}
                              {tx.accountName && (
                                <div className="flex items-center gap-3 text-sm">
                                  <User className="h-4 w-4 text-slate-400" />
                                  <div>
                                    <span className="text-slate-500">Account Name:</span>
                                    <span className="ml-2 font-medium text-slate-700">
                                      {tx.accountName}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Timestamps */}
                        <div className="flex items-center gap-6 text-xs text-slate-500 mb-4 bg-slate-50 p-3 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>Created: {tx.timestamp?.toDate
                              ? tx.timestamp.toDate().toLocaleString()
                              : "Unknown"}</span>
                          </div>
                          {tx.updatedAt && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              <span>Updated: {tx.updatedAt?.toDate
                                ? tx.updatedAt.toDate().toLocaleString()
                                : "Unknown"}</span>
                            </div>
                          )}
                        </div>

                        {/* Proof Image */}
                        {tx.proof && (
                          <div className="mb-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openImagePreview(tx.proof)}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 rounded-full"
                            >
                              <FileImage className="h-4 w-4 mr-2" />
                              View Transaction Proof
                            </Button>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div className="flex gap-3">
                            {tx.status === "pending" ? (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full px-6"
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
                                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full px-6"
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
                                className="border-slate-300 hover:bg-slate-50 rounded-full px-6"
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Reset to Pending
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Enhanced Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-8 p-6 bg-slate-50 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-slate-600">
                        Page {currentPage} of {totalPages}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleFirstPage}
                          disabled={currentPage === 1 || loading}
                          className="rounded-full hover:bg-slate-100"
                        >
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePrevPage}
                          disabled={currentPage === 1 || loading}
                          className="rounded-full hover:bg-slate-100"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        {/* Page indicator */}
                        <div className="px-4 py-2 bg-white rounded-full border text-sm font-medium min-w-[100px] text-center">
                          {currentPage} / {totalPages}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages || loading}
                          className="rounded-full hover:bg-slate-100"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleLastPage}
                          disabled={currentPage === totalPages || loading}
                          className="rounded-full hover:bg-slate-100"
                        >
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="text-sm font-medium text-slate-600">
                        Showing {transactions.length} of {totalItems}
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-4 w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentPage / totalPages) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Image Preview Modal */}
      <ImagePreviewModal 
        imageUrl={previewImage} 
        isOpen={isModalOpen} 
        onClose={closeImagePreview} 
      />
    </>
  );
}