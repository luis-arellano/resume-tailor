// Your current template renamed
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';

export default function ClassicTemplate({ 
  resumeData, 
  refs,
  createEditableField,
  createFormattedField,
  handleDelete,
  addItem,
}) {
  // Backward compatibility: use createEditableField if createFormattedField not provided
  const formatField = createFormattedField || createEditableField;
  // Your existing template code here
  return (

    <div className='container mx-2'>


      <div className="a4-size">

        <div className="flex bg-zinc-50 p-4 mb-4">
          {/* <!-- Left Column for Name and Position --> */}
          <div className="flex-1">

            {createEditableField('ContactInformation.Name', 'No Name Provided', 'h1', 'text-2xl font-bold')}
            {createEditableField('ContactInformation.Position', '', 'p', 'text-sm text-gray-600')}

          </div>

          {/* <!-- Right Column for Contact Information --> */}
          <div className="flex-1 text-right text-xs italic">
            {createEditableField('ContactInformation.Email', 'No Email Provided', 'p')}
            {createEditableField('ContactInformation.Phone', 'No Phone Provided', 'p')}
            {createEditableField('ContactInformation.Location', 'No Location Provided', 'p', 'mb-2')}
          </div>
        </div>

        <div className='p-4'>
          {resumeData.Experience && resumeData.Experience.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-2">Work Experience</h2>
              {resumeData.Experience.map((exp, index) => (
                <div key={index} className="mb-6">
                  <div className="flex justify-between items-baseline">

                    {createEditableField(`Experience[${index}].Company`, '', 'h3', 'text-lg font-semibold')}
                    <div className="text-xs text-gray-600">
                      {formatField(`Experience[${index}].StartDate`, '', 'span', '', true)} - {formatField(`Experience[${index}].EndDate`, '', 'span', '', true)}
                    </div>
                  </div>
                  {createEditableField(`Experience[${index}].Title`, '', 'h4', 'italic text-base text-gray-800')}

                  {createEditableField(`Experience[${index}].Overview`, '', 'p', 'text-sm mb-1')}
                  {exp.Responsibilities && (
                    <ul className="list-disc pl-5 text-sm">
                      {exp.Responsibilities.map((res, resIndex) => (
                        <li key={resIndex} className="relative mb-2 group">
                          {createEditableField(`Experience[${index}].Responsibilities[${resIndex}]`, '', 'span')}
                          <button
                            onClick={() => handleDelete(`Experience[${index}].Responsibilities`, resIndex)}
                            className="absolute buttom-0 right-0 text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                            <FaRegTrashAlt className="w-3 h-3" />
                            </button>
                        </li>
                      ))}

                      <li className="list-none">

                        <button
                          onClick={() => addItem(`Experience[${index}].Responsibilities`)}
                          className=" no-print xs-text h-0 mb mt-2 hover:text-blue-500 transition-colors duration-200 flex items-center opacity-20 hover:opacity-100"
                        >
                          <span className=" no-print inline-flex items-center justify-center w-3 h-3 mr-2 border border-blue-500 rounded-full">
                            <FaPlus className="w-2 h-2" />
                          </span>
                          Add
                        </button>
                      </li>

                    </ul>
                  )}
                </div>
              ))}
            </>
          )}

          {resumeData.Projects && resumeData.Projects.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-2">Projects</h2>
              {resumeData.Projects.map((project, index) => (
                <div key={index} className="mb-4 group">
                  <div className="flex justify-between items-baseline">
                    {createEditableField(`Projects[${index}].Name`, '', 'h3', 'text-sm font-semibold')}
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-600">
                        {createEditableField(`Projects[${index}].Duration`, '', 'span')}
                      </div>
                      <button
                        onClick={() => handleDelete('Projects', index)}
                        className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaRegTrashAlt className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {createEditableField(`Projects[${index}].Description`, '', 'p', 'text-sm')}
                </div>
              ))}
              <button
                onClick={() => addItem('Projects')}
                className="no-print text-sm mb-2 hover:text-blue-500 transition-colors duration-200 flex items-center opacity-20 hover:opacity-100"
              >
                <span className="no-print inline-flex items-center justify-center w-3 h-3 mr-2 border border-blue-500 rounded-full">
                  <FaPlus className="w-2 h-2" />
                </span>
                Add Project
              </button>
            </>
          )}

          {resumeData.Education && resumeData.Education.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-2">Education</h2>
              {resumeData.Education.map((edu, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-baseline">
                    {createEditableField(`Education[${index}].School`, '', 'h3', 'text-sm font-semibold')}
                    {formatField(`Education[${index}].Date`, '', 'span', 'text-xs text-gray-600', true)}
                  </div>
                  {createEditableField(`Education[${index}].Degree`, '', 'p', 'text-sm')}
                </div>
              ))}
            </>
          )}
          {resumeData.Skills && resumeData.Skills.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-2">Skills</h2>
              <p className="text-xs">
                {resumeData.Skills.map((skill, index) => (
                  <span key={index}>
                    {createEditableField(`Skills[${index}]`, '', 'span')}
                    {index < resumeData.Skills.length - 1 ? ', ' : ''}
                  </span>
                ))}
                <button
                  onClick={() => addItem('Skills')}
                  className="no-print xs-text mb-0 hover:text-blue-500 transition-colors duration-200 flex items-center opacity-20 hover:opacity-100"
                >
                  <span className="no-print inline-flex items-center justify-center w-3 h-3 mr-2 border border-blue-500 rounded-full">
                    <FaPlus className="w-2 h-2" />
                  </span>
                  Add Skill
                </button>
              </p>
            </>
          )}

          {resumeData.Languages && resumeData.Languages.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-2">Languages</h2>
              <p className="text-sm">
                {resumeData.Languages.map((lang, index) => (
                  <span key={index}>
                    {createEditableField(`Languages[${index}]`, '', 'span')}
                    {index < resumeData.Languages.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </p>
            </>
          )}

          {resumeData.OtherInformation && resumeData.OtherInformation.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-2">Other</h2>
              <p className="text-sm">
                {resumeData.OtherInformation.map((info, index) => (
                  <span key={index}>
                    {createEditableField(`OtherInformation[${index}]`, '', 'span')}
                    {index < resumeData.OtherInformation.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}