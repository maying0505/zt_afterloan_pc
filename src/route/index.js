import Loadable from 'react-loadable';
import Loading from '../components/Loading';

const AsyncError = Loadable({
        loader: () => import('../components/ErrorPage'),
        loading: Loading,
    }
);
const AsyncLoading = Loadable({
        loader: () => import('../components/Loading'),
        loading: Loading,
    }
);
const AsyncNotFound = Loadable({
        loader: () => import('../components/NotFound'),
        loading: Loading,
    }
);
const AsyncErrorBoundary = Loadable({
        loader: () => import('../components/ErrorBoundary'),
        loading: Loading,
    }
);

const Login = Loadable({
    loader: () => import('../pages/Login'),
    loading: Loading,
});

const MyDivision = Loadable({
    loader: () => import('../pages/MyDivision'),
    loading: Loading,
});
const AllDivision = Loadable({
    loader: () => import('../pages/AllDivision'),
    loading: Loading,
});
const CollectionConfig = Loadable({
    loader: () => import('../pages/CollectionConfig'),
    loading: Loading,
});
const CollectionRecord = Loadable({
    loader: () => import('../pages/CollectionRecord'),
    loading: Loading,
});
const CollectionMemberSet = Loadable({
    loader: () => import('../pages/CollectionMemberSet'),
    loading: Loading,
});
const DivisionDetail = Loadable({
    loader: () => import('../pages/DivisionDetail'),
    loading: Loading,
});
const SendMsg = Loadable({
    loader: () => import('../pages/SendMsg'),
    loading: Loading,
});
const SendMsgRecord = Loadable({
    loader: () => import('../pages/SendMsgRecord'),
    loading: Loading,
});
const PayList = Loadable({
    loader: () => import('../pages/PayList'),
    loading: Loading,
});
const OverdueAccount = Loadable({
    loader: () => import('../pages/OverdueAccount'),
    loading: Loading,
});
const ExternalCompany = Loadable({
    loader: () => import('../pages/ExternalCompany'),
    loading: Loading,
});
const DivisionLog = Loadable({
    loader: () => import('../pages/DivisionLog'),
    loading: Loading,
});
const OuterCase = Loadable({
    loader: () => import('../pages/OuterCase'),
    loading: Loading,
});
const Layout = Loadable({
    loader: () => import('../pages/Layout'),
    loading: Loading,
});
const CompanyCase = Loadable({
    loader: () => import('../pages/CompanyCase'),
    loading: Loading,
});
const DataOverview = Loadable({
    loader: () => import('../pages/DataOverview'),
    loading: Loading,
});
const CollectionData = Loadable({
    loader: () => import('../pages/CollectionData'),
    loading: Loading,
});
const CompanyStatistics = Loadable({
    loader: () => import('../pages/CompanyStatistics'),
    loading: Loading,
});
const StatisticsIndex = Loadable({
    loader: () => import('../pages/StatisticsIndex'),
    loading: Loading,
});
const RecordList = Loadable({
    loader: () => import('../pages/RecordList'),
    loading: Loading,
});


const LoginComponentProps = {
    path: '/',
    link: '/',
    component: Login,
    exact: true,
};

const LayoutRoute = [
    {
        id: 0,
        path: '/main/myDivision',
        link: '/main/MyDivision',
        exact: true,
        component: MyDivision,
    },
    {
        id: 1,
        path: '/main/allDivision/:currentPage',
        link: '/main/allDivision',
        exact: true,
        component: AllDivision,
    },
    {
        id: 2,
        path: '/main/collectionConfig',
        link: '/main/collectionConfig',
        exact: true,
        component: CollectionConfig,
    },
    {
        id: 3,
        path: '/main/collectionRecord',
        link: '/main/collectionRecord',
        exact: true,
        component: CollectionRecord,
    },
    {
        id: 4,
        path: '/main/collectionMemberSet',
        link: '/main/collectionMemberSet',
        exact: true,
        component: CollectionMemberSet,
    },
    {
        id: 5,
        path: '/main/divisionDetail/:caseId',
        link: '/main/divisionDetail',
        exact: true,
        component: DivisionDetail,
    },
    {
        id: 6,
        path: '/main/sendMsg',
        link: '/main/sendMsg',
        exact: true,
        component: SendMsg,
    },
    {
        id: 7,
        path: '/main/sendMsgRecord',
        link: '/main/sendMsgRecord',
        exact: true,
        component: SendMsgRecord,
    },
    {
        id: 8,
        path: '/main/payList',
        link: '/main/payList',
        exact: true,
        component: PayList,
    },
    {
        id: 9,
        path: '/main/overdueAccount',
        link: '/main/overdueAccount',
        exact: true,
        component: OverdueAccount,
    },
    {
        id: 10,
        path: '/main/externalCompany',
        link: '/main/externalCompany',
        exact: true,
        component: ExternalCompany,
    },
    {
        id: 11,
        path: '/main/divisionLog',
        link: '/main/divisionLog',
        exact: true,
        component: DivisionLog,
    },
    {
        id: 12,
        path: '/main/outerCase/:companyId',
        link: '/main/outerCase',
        exact: true,
        component: OuterCase,
    },
    {
        id: 13,
        path: '/main/companyCase',
        link: '/main/companyCase',
        exact: true,
        component: CompanyCase,
    },
    {
        id: 14,
        path: '/main/dataOverview',
        link: '/main/dataOverview',
        exact: true,
        component: DataOverview,
    },
    {
        id: 15,
        path: '/main/collectionData',
        link: '/main/collectionData',
        exact: true,
        component: CollectionData,
    },
    {
        id: 16,
        path: '/main/companyStatistics',
        link: '/main/companyStatistics',
        exact: true,
        component: CompanyStatistics,
    },
    {
        id: 17,
        path: '/main/statisticsIndex',
        link: '/main/statisticsIndex',
        exact: true,
        component: StatisticsIndex,
    },
    {
        id: 18,
        path: '/main/recordList',
        link: '/main/recordList',
        exact: true,
        component: RecordList,
    },
    {
        component: AsyncNotFound,
    },
];

const mainRoute = [
    {
        path: '/main',
        link: '/main',
        exact: false,
        component: Layout,
    },
    ...LayoutRoute,
];

export {
    mainRoute,
    AsyncError,
    AsyncLoading,
    LayoutRoute,
    AsyncErrorBoundary,
    LoginComponentProps,
}