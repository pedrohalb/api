import React from 'react';
import { Pagination } from 'react-bootstrap';
import '../App.css';

const PaginationControl = ({ currentPage, totalPages, handlePageChange }) => {
  return (
    <Pagination className="custom-pagination">
      <Pagination.Prev
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &lt;
      </Pagination.Prev>

      {[...Array(totalPages).keys()]
        .filter((page) => {
          const pageIndex = page + 1;
          if (currentPage === 1) return pageIndex <= 3;
          if (currentPage === totalPages) return pageIndex >= totalPages - 2;
          return pageIndex === currentPage || pageIndex === currentPage - 1 || pageIndex === currentPage + 1;
        })
        .map((page) => (
          <Pagination.Item
            key={page + 1}
            active={page + 1 === currentPage}
            onClick={() => handlePageChange(page + 1)}
          >
            {page + 1}
          </Pagination.Item>
        ))}

      <Pagination.Next
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &gt;
      </Pagination.Next>
    </Pagination>
  );
};

export default PaginationControl;
