var tblHrmEmployeeDetails = require("../models/tbl_hrm_employee_details");
var tblHrmEmployeeLeaveTrack = require("../models/tbl_hrm_employee_leave_track");
const sequelize = require("../common/dbconfig").sequelize;
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
tblHrmEmployeeDetails = tblHrmEmployeeDetails(sequelize, Sequelize);
tblHrmEmployeeLeaveTrack = tblHrmEmployeeLeaveTrack(sequelize, Sequelize);

exports.leaveTrack = (req, res, next) => {
  var offset = (req.query.page - 1) * req.query.perpage;
  var countPerPage = parseInt(req.query.perpage);
  var currentPageNo = req.query.page;
  var orderBy = req.query.field;
  var sortBy = req.query.sort;
//            $this->view->role_id = $this->_seesion->role_id;
  if (orderBy === undefined || sortBy === undefined) {
      var orderBy = 'leave_date';
      var sortBy = 'DESC';
  }

  var emp_id = (req.query.employee_id) ? req.query.employee_id : null;
  var emp_name = (req.query.employee_name) ? req.query.employee_name : null;
  var city_search = (req.query.city_search) ? req.query.city_search : null;
  var leave_date = (req.query.leave_date) ? req.query.leave_date : null;
  var leave_status = (req.query.leave_status) ? req.query.leave_status : null;
  var leave_type = (req.query.employee_leave) ? req.query.employee_leave : null;
  var department_type = (req.query.employee_department) ? req.query.employee_department : null;
  var designation_type = (req.query.employee_designation) ? req.query.employee_designation : null;
  var status_type = (req.query.employee_status) ? req.query.employee_status : null;
  var employee_reporting = (req.query.employee_reporting) ? req.query.employee_reporting : null;
  var whereCondition = [];

  if (emp_id != null && emp_id != '') 
  {
    whereCondition.push({ grab_id : { [Op.like]: '%'+emp_id+'%' } });
  }
  if(emp_name != null && emp_name != '')
  {
    x = "%"+emp_name+"%";
    whereCondition.push(Sequelize.where(Sequelize.fn("concat", Sequelize.col("employee_firstname")," ", Sequelize.col("employee_lastname")), { [Op.like]: x }));
  }
  if(city_search != null && city_search != 0)
  {
    whereCondition.push({ city_id: {  [Op.in]: JSON.parse(city_search) } });
  }
  if(department_type != null && department_type != 0)
  {
    whereCondition.push({ department_id: {  [Op.in]: JSON.parse(department_type) } });
  }
  if(designation_type != null && designation_type != 0)
  {
    whereCondition.push({ designation_id: {  [Op.in]: JSON.parse(designation_type) } });
  }
  if(status_type != null && status_type != 0)
  {
    whereCondition.push({ status: {  [Op.in]: JSON.parse(status_type) } });
  }
  
  tblHrmEmployeeDetails.findAll({ where : Sequelize.and(whereCondition)
  }).then(selectUser => {
    if(selectUser.length > 0)
    {
      var userIdArr = [];
      var userNameArr = [];
      var userGrabArr = [];
      var userDesgntnArr = [];
      var userDepartmntArr = [];
      var userStatusArr = [];
      selectUser.forEach(userVal => {
        userIdArr[userVal['id']] = userVal['id'];
        userVal['employee_firstname'].charAt(0).toUpperCase();
        userVal['employee_lastname'].charAt(0).toUpperCase();
        userNameArr[userVal['id']] = userVal['employee_firstname'] + " " + userVal['employee_lastname'];
        userGrabArr[userVal['id']] = userVal['grab_id'].toUpperCase();
        userDesgntnArr[userVal['id']] = userVal['designation_id'];
        userDepartmntArr[userVal['id']] = userVal['department_id'];
        userStatusArr[userVal['id']] = userVal['status'];
      });
      userIdArr = userIdArr.filter( i => i );
      userNameArr = userNameArr.filter( i => i );
      userGrabArr = userGrabArr.filter( i => i );
      userDesgntnArr = userDesgntnArr.filter( i => i );
      userDepartmntArr = userDepartmntArr.filter( i => i );
      userStatusArr = userStatusArr.filter( i => i );
  
      var whereUser = [];
      whereUser.push({ emp_id: { [Op.in]: userIdArr } });
      whereUser.push({ leave_status: { [Op.gt]: 0 }});
      if(leave_status != null && leave_status != 0)
      {
        whereUser.push({ leave_status: { [Op.in]: leave_status } });
      }
      if(leave_type != null && leave_type != 0)
      {
        whereUser.push({ leave_type: { [Op.in]: leave_type } });
      }
      if(leave_date != null && leave_date != '')
      {
        var dateArr = leave_date.split(" to ");
        var start_date = Date.parse(dateArr[0]).toDateString("yyyy-MM-dd");
        var end_date = Date.parse(dateArr[1]).toDateString("yyyy-MM-dd");
        whereUser.push({ from: { $between: [start_date, end_date] } } );
      }    
      if(employee_reporting != null && employee_reporting != 0)
      {
        whereUser.push({ approved_auid: { [Op.in]: employee_reporting } });
      }
   //   res.json("True");

    }
    else
    {
      whereUser = 'id = -1';
    }
    tblHrmEmployeeLeaveTrack.findAll({
      where: whereUser,  
      attributes: [[sequelize.fn('count', sequelize.col('*')),"count"]]
    }).then(Element => {
      var totalItemCount = Element[0].dataValues.count ? Element[0].dataValues.count : 0;
      //    res.json(Element);
    });
    tblHrmEmployeeLeaveTrack.findAll({
      offset : offset,
      limit : countPerPage,
      where: whereUser,  
      order: [['id', 'DESC']]
    }).then(selectData => {
   //   console.log(selectData);
      // var start = offset;
      // var data = [];
      // data['data'] = [];            
      // selectData.forEach(val => {                
      //     var editable = '0';
      //     if((data['hrm_mode'] === '2') && (val['leave_status'] === '1')){
      //        var datetime = new Date();
      //         if(datetime <= Date.parse(val['leave_date']).toDateString){
      //             var editable = '1';
      //         }
      //     }
      //     val['leave_reason'].charAt(0).toUpperCase();
      //     data['data'][start] = {
      //         'id'            : val['id'],
      //         'grab_id'       : userGrabArr[val['emp_id']] ? userGrabArr[val['emp_id']] : 'NA',
      //         'emp_name'      : userNameArr[val['emp_id']] ? userNameArr[val['emp_id']] : 'NA',
      //         'designation'   : designationArr[userDesgntnArr[val['emp_id']]] ? designationArr[userDesgntnArr[val['emp_id']]] : 'NA',
      //         'department'    : departmentArr[userDepartmntArr[val['emp_id']]] ? departmentArr[userDepartmntArr[val['emp_id']]] : 'NA',
      //         'city_id'       : city_arr[val['city_id']] ? city_arr[val['city_id']] : 'NA',
      //         'date'          : Date.parse(val['leave_date']).toDateStringdate,
      //         'attendance_type' : val['attendance_type'] > 0 ? val['attendance_type'] == '1' ? 'Full Day' : 'Half Day' : 'NA',
      //         'leave_type'    : leaveTypesArr[val['leave_type']] ? leaveTypesArr[val['leave_type']] : 'NA',
      //         'reason'        : val['leave_reason'],
      //         'leave_status'  : val['leave_status'],
      //         'applied_date'  : Date.parse(val['created_time']).toDateStringdate,
      //         'approved_auid' : val['approved_auid'] > 0 ?  adminNameArr[val['approved_auid']] : 'NA',
      //         'approved_date' : val['approved_date'] != 0 ? Date.parse(val['approved_date']).toDateStringdate : 'NA',
      //         'approved_comment' : val['approve_comment'],
      //         'status'        : statusArr[userStatusArr[val['emp_id']]] ? statusArr[userStatusArr[val['emp_id']]] : 'NA',
      //         'hrm_mode'      : HRMMode,
      //         'can_edit'      : editable
      //     };
      //     start = start + 1;
      
          res.json(selectData);
    // });
    // $darr = $this->_leaveTrack->selectData(array('count(*) as count'), $whereUser);
//    res.json(users);

});

  });
}