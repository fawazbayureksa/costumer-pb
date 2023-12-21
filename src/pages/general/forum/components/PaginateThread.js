import Paginate from "../../../../components/helpers/Paginate"

export default function PaginateThread({ data, lastPage, handlePage, page }) {

    return (
        <>
            {(data && lastPage > 0) &&
                <div className="d-flex justify-content-end mt-3">
                    <Paginate
                        pageCount={data ? lastPage : 1}
                        onPageChange={selected => handlePage(selected)}
                        initialPage={page}
                    />
                </div>
            }
        </>
    )
}