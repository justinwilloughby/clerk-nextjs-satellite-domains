export default function AdminPage() {
    return (
        <div>
            <h1>Admin Page</h1>
            {/* Setup an iframe to the bytehorizon-admin app */}
            <iframe src="https://admin.bytehorizon.xyz" className="w-960 h-960" />
        </div>
    );
}