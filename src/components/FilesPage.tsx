// 'use client';

// import React, { useState } from 'react';
// import { FileText, Image, Download, Calendar, Clock } from 'lucide-react';
// import { Trip } from '@/types';
// import { formatDate } from '@/lib/constants';

// interface FilesPageProps {
//   trip: Trip;
// }

// export default function FilesPage({ trip }: FilesPageProps) {
//   const [showImageModal, setShowImageModal] = useState<string | null>(null);
//   const [showPDFModal, setShowPDFModal] = useState<string | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState<string>('all');

//   // 全ファイルを収集
//   const getAllFiles = () => {
//     const allFiles: Array<{
//       file: any;
//       scheduleTitle: string;
//       scheduleTime: string;
//       date: string;
//       scheduleId: number;
//     }> = [];

//     Object.entries(trip.schedules).forEach(([date, schedules]) => {
//       schedules.forEach(schedule => {
//         if (schedule.files && schedule.files.length > 0) {
//           schedule.files.forEach(file => {
//             allFiles.push({
//               file,
//               scheduleTitle: schedule.title,
//               scheduleTime: schedule.time,
//               date,
//               scheduleId: schedule.id
//             });
//           });
//         }
//       });
//     });

//     return allFiles.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
//   };

//   const allFiles = getAllFiles();

//   const getFilesByCategory = () => {
//     switch (selectedCategory) {
//       case 'images':
//         return allFiles.filter(item => item.file.type && item.file.type.startsWith('image/'));
//       case 'pdfs':
//         return allFiles.filter(item => item.file.type === 'application/pdf');
//       case 'others':
//         return allFiles.filter(item => !item.file.type?.startsWith('image/') && item.file.type !== 'application/pdf');
//       default:
//         return allFiles;
//     }
//   };

//   const filteredFiles = getFilesByCategory();

//   const isImageFile = (file: any) => {
//     return file.type && file.type.startsWith('image/');
//   };

//   const isPDFFile = (file: any) => {
//     return file.type === 'application/pdf';
//   };

//   const getFileIcon = (file: any) => {
//     if (isImageFile(file)) {
//       return <Image className="w-5 h-5 text-blue-600" />;
//     } else if (isPDFFile(file)) {
//       return <FileText className="w-5 h-5 text-red-600" />;
//     } else {
//       return <FileText className="w-5 h-5 text-stone-600" />;
//     }
//   };

//   const formatFileSize = (url: string) => {
//     // ブラウザ環境では正確なファイルサイズを取得できないため、プレースホルダー
//     return "不明";
//   };

//   const downloadFile = (file: any) => {
//     const link = document.createElement('a');
//     link.href = file.url;
//     link.download = file.name;
//     link.click();
//   };

//   return (
//     <>
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <h2 className="text-xl font-semibold text-stone-800">ファイル一覧</h2>
//           <div className="text-sm text-stone-600">
//             合計 {allFiles.length} 件のファイル
//           </div>
//         </div>

//         {/* カテゴリフィルター */}
//         <div className="flex flex-wrap gap-2">
//           {[
//             { id: 'all', label: 'すべて', count: allFiles.length },
//             { id: 'images', label: '画像', count: allFiles.filter(item => isImageFile(item.file)).length },
//             { id: 'pdfs', label: 'PDF', count: allFiles.filter(item => isPDFFile(item.file)).length },
//             { id: 'others', label: 'その他', count: allFiles.filter(item => !isImageFile(item.file) && !isPDFFile(item.file)).length }
//           ].map(category => (
//             <button
//               key={category.id}
//               onClick={() => setSelectedCategory(category.id)}
//               className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//                 selectedCategory === category.id
//                   ? 'bg-blue-100 text-blue-800 border border-blue-200'
//                   : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
//               }`}
//             >
//               {category.label} ({category.count})
//             </button>
//           ))}
//         </div>

//         {/* ファイル一覧 */}
//         {filteredFiles.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {filteredFiles.map((item, index) => (
//               <div key={`${item.scheduleId}-${item.file.id}-${index}`} className="bg-white rounded-lg border border-stone-200 p-4 hover:shadow-md transition-shadow">
//                 {/* ファイルプレビュー */}
//                 <div className="mb-3">
//                   {isImageFile(item.file) ? (
//                     <img 
//                       src={item.file.url} 
//                       alt={item.file.name}
//                       className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
//                       onClick={() => setShowImageModal(item.file.url)}
//                     />
//                   ) : (
//                     <div 
//                       className="w-full h-32 bg-stone-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-stone-200 transition-colors"
//                       onClick={() => isPDFFile(item.file) ? setShowPDFModal(item.file.url) : downloadFile(item.file)}
//                     >
//                       {getFileIcon(item.file)}
//                       <span className="ml-2 text-sm text-stone-600">
//                         {isPDFFile(item.file) ? 'PDFを開く' : 'ファイルを開く'}
//                       </span>
//                     </div>
//                   )}
//                 </div>

//                 {/* ファイル情報 */}
//                 <div className="space-y-2">
//                   <h3 className="font-medium text-stone-800 truncate" title={item.file.name}>
//                     {item.file.name}
//                   </h3>
                  
//                   <div className="flex items-center gap-2 text-xs text-stone-500">
//                     <Calendar className="w-3 h-3" />
//                     <span>{formatDate(item.date)}</span>
//                     <Clock className="w-3 h-3" />
//                     <span>{item.scheduleTime}</span>
//                   </div>
                  
//                   <div className="text-sm text-stone-600 truncate">
//                     📍 {item.scheduleTitle}
//                   </div>

//                   <div className="flex items-center justify-between pt-2">
//                     <span className="text-xs text-stone-500">
//                       サイズ: {formatFileSize(item.file.url)}
//                     </span>
//                     <button
//                       onClick={() => downloadFile(item.file)}
//                       className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
//                     >
//                       <Download className="w-3 h-3" />
//                       ダウンロード
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-12 text-stone-500">
//             <FileText className="w-12 h-12 mx-auto mb-4 text-stone-300" />
//             <p className="text-lg font-medium mb-2">
//               {selectedCategory === 'all' ? 'ファイルがまだありません' : `${selectedCategory === 'images' ? '画像' : selectedCategory === 'pdfs' ? 'PDF' : 'その他'}ファイルがありません`}
//             </p>
//             <p className="text-sm">スケジュールにファイルを追加してみましょう</p>
//           </div>
//         )}
//       </div>

//       {/* Image Modal */}
//       {showImageModal && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
//           onClick={() => setShowImageModal(null)}
//         >
//           <div className="max-w-4xl max-h-4xl">
//             <img 
//               src={showImageModal} 
//               alt="拡大表示"
//               className="max-w-full max-h-full object-contain rounded-lg"
//               onClick={(e) => e.stopPropagation()}
//             />
//           </div>
//         </div>
//       )}

//       {/* PDF Modal */}
//       {showPDFModal && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
//           onClick={() => setShowPDFModal(null)}
//         >
//           <div className="bg-white rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
//             <div className="flex items-center justify-between p-4 border-b">
//               <h3 className="text-lg font-semibold">PDF プレビュー</h3>
//               <button
//                 onClick={() => setShowPDFModal(null)}
//                 className="text-stone-500 hover:text-stone-700"
//               >
//                 ✕
//               </button>
//             </div>
//             <div className="flex-1 p-4">
//               <iframe 
//                 src={showPDFModal}
//                 className="w-full h-full rounded"
//                 title="PDF Preview"
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }