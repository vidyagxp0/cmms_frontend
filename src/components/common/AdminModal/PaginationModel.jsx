import Dropdown from "../../../components/ui/Dropdown";
import React, { useState } from 'react'

const Pagination = ({items,children}) => {

    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage=2

    const totalPage=Math.ceil(items.length/itemsPerPage)
  
    const startIndex = (currentPage - 1) * itemsPerPage;
     const currentItems = items.slice(
        startIndex,
        startIndex + itemsPerPage
    );
    const pageOptions = Array.from(
    { length: totalPage },
    (_, index) => ({
        value: index + 1,
        label: `Page ${index + 1}`,
    })
);
    
  return (
   <div>
    {children(currentItems, startIndex)}
    <div className="mt-3 flex items-center  justify-center gap-2 pb-4">

      <button
       onClick={()=>setCurrentPage(1)}
       disabled={currentPage===1}
       className="rounded-lg border border-[#CBE3D6] bg-white px-4 py-2 text-sm font-medium text-[#39785D] transition hover:border-[#17734C] hover:bg-[#EEF8F2] hover:text-[#17734C] disabled:cursor-not-allowed disabled:opacity-50"
      >
        First
      </button>  

      <button
       onClick={()=>{
        setCurrentPage(currentPage-1)
       }}
       disabled={currentPage===1}
       className="rounded-lg border border-[#CBE3D6] bg-white px-4 py-2 text-sm font-medium text-[#39785D] transition hover:border-[#17734C] hover:bg-[#EEF8F2] hover:text-[#17734C] disabled:cursor-not-allowed disabled:opacity-50"
  >
        Previous
      </button>
      
        {/* <select
        value={currentPage} 
        onChange={(e)=>setCurrentPage(Number(e.target.value))}
        >
          {Array.from({ length: totalPage }, (_, index) => (
        // <option key={index + 1} value={index + 1}>
        //     Page {index + 1}
        // </option>
        <Dropdown/>
    ))}
        </select> */}
        <Dropdown
    value={currentPage}
    onChange={(value) => setCurrentPage(Number(value))}
    options={pageOptions}
    placeholder="Select page"
    openUp={true}
    className="w-30"
/>

      <button
      onClick={()=>{
        setCurrentPage(currentPage+1)
      }}
      disabled={currentPage===totalPage}
      className="rounded-lg border border-[#CBE3D6] bg-white px-4 py-2 text-sm font-medium text-[#39785D] transition hover:border-[#17734C] hover:bg-[#EEF8F2] hover:text-[#17734C] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
      <button
      onClick={()=>setCurrentPage(totalPage)}
      disabled={currentPage===totalPage}
       className="rounded-lg border border-[#CBE3D6] bg-white px-4 py-2 text-sm font-medium text-[#39785D] transition hover:border-[#17734C] hover:bg-[#EEF8F2] hover:text-[#17734C] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Last
      </button>
    </div>
  
    </div>
  )
}

export default Pagination
