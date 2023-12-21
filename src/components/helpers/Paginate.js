import ReactPaginate from 'react-paginate'

/**
 * 
 * @param {pageCount} pageCount total count of pages 
 * @param {onPageChange} onPageChange function when page changed
 * @param {initialPage} initialPage page number when first loaded
 */
const Paginate = (props) => {
    const onPageChange = (e) => {
        props.onPageChange(e.selected + 1)
    }
    return <ReactPaginate
        pageCount={props.pageCount}
        // pageRangeDisplayed={5}
        marginPagesDisplayed={1}
        onPageChange={onPageChange}
        // initialPage={props.initialPage - 1 || 0}
        forcePage={props.initialPage - 1 || 0}

        previousLabel={"<"}
        nextLabel={">"}
        breakLabel={"..."}

        containerClassName={`pagination justify-content-end flex-wrap`}
        breakClassName="page-item" breakLinkClassName="page-link"
        pageClassName="page-item" pageLinkClassName="page-link"
        previousClassName="page-item" previousLinkClassName="page-link"
        nextClassName="page-item" nextLinkClassName="page-link"
        activeClassName="active" activeLinkClassName=""
        disabledClassName="disabled"
    />
}
export default Paginate