export default function About() {
  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto">
        
        {/* Hero Section */}
        <div className="p-8 mb-8 bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 text-white bg-blue-600 rounded-full">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-center text-gray-800">About Our Library</h1>
          <p className="text-lg text-center text-gray-600">
            Empowering knowledge seekers through innovative digital library management
          </p>
        </div>

        {/* Mission Statement */}
        <div className="p-8 mb-8 bg-white rounded-lg shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Our Mission</h2>
          <p className="leading-relaxed text-gray-700">
            We provide a comprehensive digital library management system that makes accessing, managing, 
            and borrowing books seamless and efficient. Our platform is designed to serve both library 
            staff and members with powerful tools for book cataloging, user management, and borrowing operations.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 mb-8 md:grid-cols-2">
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <div className="p-3 mr-4 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Easy Search</h3>
            </div>
            <p className="text-gray-600">
              Find books quickly with our powerful search and filtering system. Browse by title, author, category, or ISBN.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <div className="p-3 mr-4 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Book Management</h3>
            </div>
            <p className="text-gray-600">
              Librarians can easily add, edit, and manage the entire book inventory with an intuitive interface.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <div className="p-3 mr-4 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">User Management</h3>
            </div>
            <p className="text-gray-600">
              Manage library members, track borrowing history, and maintain user accounts efficiently.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <div className="p-3 mr-4 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Real-time Tracking</h3>
            </div>
            <p className="text-gray-600">
              Monitor book availability, borrowing status, and due dates in real-time for better management.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="p-8 text-white rounded-lg shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600">
          <h2 className="mb-8 text-2xl font-bold text-center">Our Impact</h2>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="mb-2 text-4xl font-bold">1000+</div>
              <div className="text-blue-100">Books</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">500+</div>
              <div className="text-blue-100">Members</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">24/7</div>
              <div className="text-blue-100">Access</div>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="p-8 mt-8 text-center bg-white rounded-lg shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Get in Touch</h2>
          <p className="mb-6 text-gray-600">
            Have questions or suggestions? We'd love to hear from you!
          </p>
          <a 
            href="/contact" 
            className="inline-block px-8 py-3 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Contact Us
          </a>
        </div>

      </div>
    </div>
  );
}